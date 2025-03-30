<script setup lang="ts">
import { buildApiUrl } from "~/utils/apiConfig";
import { supabase } from "~/utils/supabase/supabase";
import { debounce } from "lodash";
import { onClickOutside } from "@vueuse/core";

const error = ref<string | null>(null);
const query = ref("");
const orgResults = ref([]);
const userResults = ref([]);
const fetching = ref(false);
const isFocused = ref(false);
const selected = ref(-1);
const searchCon = ref(null);
const scope = ref("all");
const results = computed(() => {
  if (scope.value === "orgs") return orgResults.value;
  if (scope.value === "users") return userResults.value;
  return [
    ...orgResults.value.map((org) => ({ ...org, type: "org" })),
    ...userResults.value.map((user) => ({ ...user, type: "user" })),
  ];
});

const search = debounce(async (query: string) => {
  if (!query.trim()) {
    fetching.value = false;
    orgResults.value = [];
    userResults.value = [];
    selected.value = -1;
    return;
  }

  fetching.value = true;

  try {
    if (scope.value === "all" || scope.value === "orgs") {
      const { data: orgData, error: orgError } = await supabase
        .from(getApiDomain().replace(/^https?:\/\//, ""))
        .select("*")
        .or(
          `Name.ilike.%${query}%,Slug.ilike.%${query}%,Organization ID.ilike.%${query}%`
        )
        .limit(15);

      if (orgError) {
        console.error("org fail", orgError);
      } else {
        orgResults.value = orgData || [];
      }
    }

    if (scope.value === "all" || scope.value === "users") {
      const { data: userData, error: userError } = await supabase
        .from(`${getApiDomain().replace(/^https?:\/\//, "")}-users`)
        .select("*")
        .or(`name.ilike.%${query}%,id.ilike.%${query}%`)
        .limit(15);

      if (userError) {
        console.error("user fail", userError);
      } else {
        userResults.value = userData || [];
      }
    }

    selected.value = results.value.length > 0 ? 0 : -1;
  } catch (err) {
    console.error("Search error:", err);
  } finally {
    fetching.value = false;
  }
}, 300);

const k = (event) => {
  if (results.value.length === 0) return;
  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      selected.value = (selected.value + 1) % results.value.length;
      goResult();
      break;
    case "ArrowUp":
      event.preventDefault();
      selected.value =
        selected.value <= 0 ? results.value.length - 1 : selected.value - 1;
      goResult();
      break;
    case "Tab":
      event.preventDefault();
      if (event.shiftKey) {
        selected.value =
          selected.value <= 0 ? results.value.length - 1 : selected.value - 1;
      } else {
        selected.value = (selected.value + 1) % results.value.length;
      }
      goResult();
      break;
    case "Enter":
      event.preventDefault();
      if (selected.value >= 0) {
        sendResult(results.value[selected.value]);
      }
      break;
    case "Escape":
      event.preventDefault();
      isFocused.value = false;
      break;
  }
};

const sendResult = (result) => {
  const router = useRouter();
  if (result.type === "user" || result.id) {
    router.push(`/app/usr/${result.id}`);
  } else {
    router.push(`/app/org/${result["Organization ID"]}`);
  }

  query.value = "";
  orgResults.value = [];
  userResults.value = [];
  selected.value = -1;
  isFocused.value = false;
};

const goResult = () => {
  nextTick(() => {
    const selectedElement = document.getElementById(
      `search-result-${selected.value}`
    );
    if (selectedElement) {
      selectedElement.scrollIntoView({ block: "nearest" });
    }
  });
};

const setScope = (type) => {
  scope.value = type;
  if (query.value) {
    search(query.value);
  }
};

const f = () => {
  isFocused.value = true;
};

const b = () => {
  setTimeout(() => {
    isFocused.value = false;
  }, 150);
};

onMounted(() => {
  onClickOutside(searchCon.value, () => {
    isFocused.value = false;
  });

  const slash = (event) => {
    if (event.key === "/" && document.activeElement?.tagName !== "INPUT") {
      event.preventDefault();
      document.getElementById("search-input")?.focus();
    }
  };
  window.addEventListener("keydown", slash);
  onUnmounted(() => {
    window.removeEventListener("keydown", slash);
  });
});

watch(query, (newQuery) => {
  if (newQuery.trim()) {
    fetching.value = true;
  }
  search(newQuery);
});
</script>
<template>
  <div class="mb-4">
    <div ref="searchCon" class="relative">
      <div
        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
        v-if="!fetching"
      >
        <svg
          class="h-5 w-5 text-zinc-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
      <div
        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
        v-else
      >
        <svg
          class="animate-spin h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>

      <div
        class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
      >
        <span
          class="px-2 py-0.5 text-xs rounded bg-zinc-700 text-zinc-400"
          v-show="!isFocused"
        >
          /
        </span>
      </div>

      <input
        id="search-input"
        v-model="query"
        @focus="f"
        @blur="b"
        @keydown="k"
        type="text"
        class="block w-full bg-zinc-900 rounded-lg py-3 pl-10 pr-10 text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
        placeholder="Search for organizations or users on HCB..."
        autocomplete="off"
      />
      <div
        v-if="isFocused && !query"
        class="absolute z-10 w-full mt-1 bg-zinc-800 rounded-lg shadow-lg overflow-hidden"
      >
        <div class="border-b border-zinc-700">
          <div class="flex">
            <button
              @click="setScope('all')"
              class="px-4 py-2 text-sm transition-colors"
              :class="
                scope === 'all'
                  ? 'text-white border-b-2 border-blue-500'
                  : 'text-zinc-400 hover:text-white'
              "
            >
              All
            </button>
            <button
              @click="setScope('orgs')"
              class="px-4 py-2 text-sm transition-colors"
              :class="
                scope === 'orgs'
                  ? 'text-white border-b-2 border-blue-500'
                  : 'text-zinc-400 hover:text-white'
              "
            >
              Organizations
            </button>
            <button
              @click="setScope('users')"
              class="px-4 py-2 text-sm transition-colors"
              :class="
                scope === 'users'
                  ? 'text-white border-b-2 border-blue-500'
                  : 'text-zinc-400 hover:text-white'
              "
            >
              Users
            </button>
          </div>
        </div>

        <div class="px-4 py-3 text-zinc-400">
          <p>Start typing to search. You can search for:</p>
          <ul
            class="mt-1 text-sm list-disc pl-5 space-y-1"
            v-if="scope !== 'users'"
          >
            <li>Organization name</li>
            <li>Category</li>
            <li>URL slug</li>
            <li>Organization ID</li>
          </ul>
          <ul
            class="mt-1 text-sm list-disc pl-5 space-y-1"
            v-if="scope !== 'orgs'"
          >
            <li>User name</li>
            <li>User ID</li>
          </ul>
          <p class="mt-2 text-xs text-zinc-500">
            <span class="bg-zinc-700 text-zinc-400 px-1.5 rounded">↑/↓</span>
            to navigate •
            <span class="bg-zinc-700 text-zinc-400 px-1.5 rounded">Tab</span>
            to cycle •
            <span class="bg-zinc-700 text-zinc-400 px-1.5 rounded">Enter</span>
            to select
          </p>
        </div>
      </div>

      <transition
        name="dropdown"
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 transform -translate-y-2"
        enter-to-class="opacity-100 transform translate-y-0"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 transform translate-y-0"
        leave-to-class="opacity-0 transform -translate-y-2"
      >
        <div
          v-if="fetching && isFocused"
          class="absolute z-10 w-full mt-1 bg-zinc-800 rounded-lg shadow-lg"
        >
          <div class="px-4 py-2 text-zinc-400 animate-pulse">Searching...</div>
        </div>
      </transition>

      <transition
        name="dropdown"
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0 transform -translate-y-2"
        enter-to-class="opacity-100 transform translate-y-0"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 transform translate-y-0"
        leave-to-class="opacity-0 transform -translate-y-2"
        v-if="results.length > 0 && isFocused"
      >
        <div
          class="absolute w-full mt-1 bg-zinc-800 bg-opacity-80 backdrop-blur-md rounded-lg shadow-lg z-10 max-h-80 overflow-y-auto"
        >
          <transition-group
            name="list"
            tag="div"
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="opacity-0 transform scale-95"
            enter-to-class="opacity-100 transform scale-100"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100 transform scale-100"
            leave-to-class="opacity-0 transform scale-95"
          >
            <div
              v-if="scope === 'all' && orgResults.length > 0"
              key="org-header"
              class="px-4 py-2 text-xs font-semibold text-zinc-500 bg-zinc-800 sticky top-0"
            >
              Organizations
            </div>
            <div
              v-for="(org, index) in scope === 'all' ? orgResults : results"
              :id="`search-result-${scope === 'all' ? index : index}`"
              :key="'org_' + org['Organization ID']"
              :class="[
                'px-4 py-3 cursor-pointer flex justify-between items-center transition duration-200 ease-in-out',
                selected === (scope === 'all' ? index : index)
                  ? 'bg-blue-900/40 border-l-2 border-blue-500'
                  : 'hover:bg-zinc-700 border-l-2 border-transparent',
              ]"
              :style="{ transitionDelay: `${index * 25}ms` }"
              @mouseenter="selected = scope === 'all' ? index : index"
              @click="sendResult({ ...org, type: 'org' })"
            >
              <div class="flex-grow">
                <div class="text-white font-semibold">{{ org.Name }}</div>
                <div class="flex items-center mt-1">
                  <span class="text-zinc-400 text-sm">{{ org.Slug }}</span>
                  <span
                    v-if="org.Category"
                    class="ml-2 px-2 py-0.5 text-xs rounded-full bg-zinc-700 text-zinc-300"
                  >
                    {{ org.Category }}
                  </span>
                </div>
              </div>
              <div>
                <div
                  class="inline-block px-2 py-0.5 text-xs font-mono rounded-full"
                  :class="{
                    'bg-green-500/10 border border-green-500/20 text-green-400':
                      new Date() - new Date(org.Added) <= 30 * 60 * 1000,
                    'bg-orange-500/10 border border-orange-500/20 text-orange-400':
                      new Date() - new Date(org.Added) > 30 * 60 * 1000 &&
                      new Date() - new Date(org.Added) <= 24 * 60 * 60 * 1000,
                    'bg-red-500/10 border border-red-500/20 text-red-400':
                      new Date() - new Date(org.Added) > 24 * 60 * 60 * 1000,
                  }"
                >
                  Updated: {{ relativeTime(org.Added) }}
                </div>
              </div>
              <div class="text-zinc-400 text-sm ml-4 text-right">
                <div class="mt-1">Balance: {{ fixMoney(org.Balance) }}</div>
                <div class="text-xs text-zinc-500 mt-1 font-mono">
                  {{ org["Organization ID"] }}
                </div>
              </div>
            </div>
            <div
              v-if="scope === 'all' && userResults.length > 0"
              key="user-header"
              class="px-4 py-2 text-xs font-semibold text-zinc-500 bg-zinc-800 sticky top-0"
            >
              Users
            </div>
            <div
              v-for="(user, index) in scope === 'all'
                ? userResults
                : scope === 'users'
                ? results
                : []"
              :id="`search-result-${
                scope === 'all' ? orgResults.length + index : index
              }`"
              :key="'user_' + user.id"
              :class="[
                'px-4 py-3 cursor-pointer flex justify-between items-center transition duration-200 ease-in-out',
                selected ===
                (scope === 'all' ? orgResults.length + index : index)
                  ? 'bg-blue-900/40 border-l-2 border-blue-500'
                  : 'hover:bg-zinc-700 border-l-2 border-transparent',
              ]"
              :style="{ transitionDelay: `${index * 25}ms` }"
              @mouseenter="
                selected = scope === 'all' ? orgResults.length + index : index
              "
              @click="sendResult({ ...user, type: 'user' })"
            >
              <div class="flex items-center">
                <div class="mr-3">
                  <img
                    v-if="user.avatar"
                    :src="user.avatar"
                    alt="User Avatar"
                    class="h-10 w-10 rounded-full object-cover"
                  />
                  <div
                    v-else
                    class="h-10 w-10 bg-zinc-700 rounded-full flex items-center justify-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-6 w-6 text-zinc-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <div class="text-white font-semibold">{{ user.name }}</div>
                  <div class="flex items-center mt-1">
                    <span class="text-xs text-blue-400 font-mono">{{
                      user.id
                    }}</span>
                    <span
                      class="ml-2 px-2 py-0.5 text-xs rounded-full bg-zinc-700 text-zinc-300"
                    >
                      {{ user.orgs?.length || 0 }} organizations
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </transition-group>
        </div>
      </transition>

      <transition
        name="dropdown"
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 transform -translate-y-2"
        enter-to-class="opacity-100 transform translate-y-0"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 transform translate-y-0"
        leave-to-class="opacity-0 transform -translate-y-2"
        v-else-if="!fetching && query && isFocused && results.length === 0"
      >
        <div
          class="absolute w-full mt-1 bg-zinc-800 bg-opacity-80 backdrop-blur-md rounded-lg shadow-lg z-10"
        >
          <div class="px-4 py-3 text-red-400">
            <p>
              We looked everywhere but we can't find anything with the query
              <span class="font-semibold">{{ query }}</span>
            </p>
            <p class="text-sm text-zinc-400 mt-1">
              This could be because the item is not indexed yet, it does not
              exist, or you made a typo looking for something else.
            </p>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>
<style scoped>
.list-move {
  transition: transform 0.3s ease;
}
.dropdown-enter-active,
.dropdown-leave-active,
.list-enter-active,
.list-leave-active {
  position: absolute;
  width: 100%;
}
</style>
