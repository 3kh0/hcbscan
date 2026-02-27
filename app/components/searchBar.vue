<script setup lang="ts">
  import _ from "lodash";
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

  const search = _.debounce(async (query) => {
    if (!query.trim()) {
      fetching.value = false;
      orgResults.value = [];
      userResults.value = [];
      selected.value = -1;
      return;
    }

    fetching.value = true;

    try {
      const data = await $fetch("/api/search", {
        params: { q: query, scope: scope.value, limit: 15 },
      });

      orgResults.value = data.orgs || [];
      userResults.value = data.users || [];
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
  <div class="mb-6">
    <div ref="searchCon" class="relative">
      <!-- Search icon / spinner -->
      <div
        v-if="!fetching"
        class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
      >
        <svg
          class="h-4.5 w-4.5 text-zinc-500"
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
        v-else
        class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
      >
        <svg
          class="animate-spin h-4.5 w-4.5 text-green-400"
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
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>

      <!-- Slash shortcut hint -->
      <div
        class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
      >
        <span
          v-show="!isFocused"
          class="px-1.5 py-0.5 text-xs rounded border border-white/[0.08] bg-white/[0.05] text-zinc-400 font-mono"
        >
          /
        </span>
      </div>

      <input
        id="search-input"
        v-model="query"
        type="text"
        class="block w-full bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl py-3 pl-10 pr-10 text-white placeholder-zinc-500 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/30 shadow-lg shadow-black/20 transition-all duration-200"
        placeholder="Search organizations or users..."
        autocomplete="off"
        @focus="f"
        @blur="b"
        @keydown="k"
      >

      <!-- Empty focus state — scope tabs + hints -->
      <div
        v-if="isFocused && !query"
        class="absolute z-10 w-full mt-1.5 bg-white/[0.03] backdrop-blur-md border border-white/[0.06] rounded-2xl shadow-lg shadow-black/20 overflow-hidden"
      >
        <div class="border-b border-white/[0.06]">
          <div class="flex px-1 pt-1">
            <button
              class="px-3 py-2 text-sm rounded-t transition-colors"
              :class="
                scope === 'all'
                  ? 'text-white border-b-2 border-green-500'
                  : 'text-zinc-400 hover:text-white'
              "
              @click="setScope('all')"
            >
              All
            </button>
            <button
              class="px-3 py-2 text-sm rounded-t transition-colors"
              :class="
                scope === 'orgs'
                  ? 'text-white border-b-2 border-green-500'
                  : 'text-zinc-400 hover:text-white'
              "
              @click="setScope('orgs')"
            >
              Organizations
            </button>
            <button
              class="px-3 py-2 text-sm rounded-t transition-colors"
              :class="
                scope === 'users'
                  ? 'text-white border-b-2 border-green-500'
                  : 'text-zinc-400 hover:text-white'
              "
              @click="setScope('users')"
            >
              Users
            </button>
          </div>
        </div>

        <div class="px-4 py-3 text-zinc-400">
          <p class="text-sm">Start typing to search. You can search for:</p>
          <ul
            v-if="scope !== 'users'"
            class="mt-1.5 text-sm text-zinc-500 list-disc pl-5 space-y-0.5"
          >
            <li>Organization name or URL slug</li>
            <li>Category or Organization ID</li>
          </ul>
          <ul
            v-if="scope !== 'orgs'"
            class="mt-1.5 text-sm text-zinc-500 list-disc pl-5 space-y-0.5"
          >
            <li>User name or User ID</li>
          </ul>
          <p class="mt-3 text-xs text-zinc-600 flex items-center gap-1.5 flex-wrap">
            <span class="bg-zinc-800 border border-zinc-700 text-zinc-300 px-1.5 py-0.5 rounded font-mono text-xs">↑</span>
            <span class="bg-zinc-800 border border-zinc-700 text-zinc-300 px-1.5 py-0.5 rounded font-mono text-xs">↓</span>
            navigate ·
            <span class="bg-zinc-800 border border-zinc-700 text-zinc-300 px-1.5 py-0.5 rounded font-mono text-xs">Tab</span>
            cycle ·
            <span class="bg-zinc-800 border border-zinc-700 text-zinc-300 px-1.5 py-0.5 rounded font-mono text-xs">Enter</span>
            select ·
            <span class="bg-zinc-800 border border-zinc-700 text-zinc-300 px-1.5 py-0.5 rounded font-mono text-xs">Esc</span>
            close
          </p>
        </div>
      </div>

      <!-- Searching indicator -->
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
          class="absolute z-10 w-full mt-1.5 bg-white/[0.03] backdrop-blur-md border border-white/[0.06] rounded-2xl shadow-lg shadow-black/20"
        >
          <div class="px-4 py-3 text-sm text-zinc-400 animate-pulse">Searching...</div>
        </div>
      </transition>

      <!-- Results dropdown -->
      <transition
        v-if="results.length > 0 && isFocused"
        name="dropdown"
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0 transform -translate-y-2"
        enter-to-class="opacity-100 transform translate-y-0"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 transform translate-y-0"
        leave-to-class="opacity-0 transform -translate-y-2"
      >
        <div
          class="absolute w-full mt-1.5 bg-white/[0.03] backdrop-blur-md border border-white/[0.06] rounded-2xl shadow-lg shadow-black/20 z-10 max-h-80 overflow-y-auto"
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
              class="px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-zinc-500 bg-zinc-950/80 backdrop-blur-sm sticky top-0 border-b border-white/[0.06]"
            >
              Organizations
            </div>
            <div
              v-for="(org, index) in scope === 'all' ? orgResults : results"
              :id="`search-result-${scope === 'all' ? index : index}`"
              :key="'org_' + org['Organization ID']"
              :class="[
                'px-4 py-3 cursor-pointer flex justify-between items-center transition-colors duration-150',
                selected === (scope === 'all' ? index : index)
                  ? 'bg-green-900/25 border-l-2 border-green-500'
                  : 'hover:bg-zinc-800/60 border-l-2 border-transparent',
              ]"
              :style="{ transitionDelay: `${index * 25}ms` }"
              @mouseenter="selected = scope === 'all' ? index : index"
              @click="sendResult({ ...org, type: 'org' })"
            >
              <div class="flex-grow min-w-0">
                <div class="text-white font-medium text-sm">{{ org.Name }}</div>
                <div class="flex items-center mt-0.5 gap-1.5">
                  <span class="text-zinc-500 text-xs font-mono">{{ org.Slug }}</span>
                  <span
                    v-if="org.Category"
                    class="px-1.5 py-0.5 text-xs rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400"
                  >
                    {{ org.Category }}
                  </span>
                </div>
              </div>
              <div class="flex flex-col items-end ml-4 shrink-0">
                <div
                  class="inline-block px-1.5 py-0.5 text-xs font-mono rounded-full"
                  :class="{
                    'bg-green-500/10 border border-green-500/20 text-green-400':
                      new Date() - new Date(org.Added) <= 30 * 60 * 1000,
                    'bg-orange-500/10 border border-orange-500/20 text-orange-400':
                      new Date() - new Date(org.Added) > 30 * 60 * 1000 &&
                      new Date() - new Date(org.Added) <= 24 * 60 * 60 * 1000,
                    'bg-zinc-800 border border-zinc-700 text-zinc-500':
                      new Date() - new Date(org.Added) > 24 * 60 * 60 * 1000,
                  }"
                >
                  {{ relativeTime(org.Added) }}
                </div>
                <div class="text-zinc-400 text-xs mt-1 tabular-nums">{{ fixMoney(org.Balance) }}</div>
              </div>
            </div>
            <div
              v-if="scope === 'all' && userResults.length > 0"
              key="user-header"
              class="px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-zinc-500 bg-zinc-950/80 backdrop-blur-sm sticky top-0 border-b border-white/[0.06]"
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
                'px-4 py-3 cursor-pointer flex justify-between items-center transition-colors duration-150',
                selected ===
                (scope === 'all' ? orgResults.length + index : index)
                  ? 'bg-green-900/25 border-l-2 border-green-500'
                  : 'hover:bg-zinc-800/60 border-l-2 border-transparent',
              ]"
              :style="{ transitionDelay: `${index * 25}ms` }"
              @mouseenter="
                selected = scope === 'all' ? orgResults.length + index : index
              "
              @click="sendResult({ ...user, type: 'user' })"
            >
              <div class="flex items-center gap-3">
                <div>
                  <img
                    v-if="user.avatar"
                    :src="user.avatar"
                    alt="User Avatar"
                    class="h-9 w-9 rounded-full object-cover ring-1 ring-white/10"
                  >
                  <div
                    v-else
                    class="h-9 w-9 bg-zinc-800 rounded-full flex items-center justify-center ring-1 ring-white/10"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5 text-zinc-500"
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
                  <div class="text-white font-medium text-sm">{{ user.name }}</div>
                  <div class="flex items-center mt-0.5 gap-1.5">
                    <span class="text-xs text-green-400 font-mono">{{ user.id }}</span>
                    <span class="px-1.5 py-0.5 text-xs rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400">
                      {{ user.orgs?.length || 0 }} orgs
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </transition-group>
        </div>
      </transition>

      <!-- No results state -->
      <transition
        v-else-if="!fetching && query && isFocused && results.length === 0"
        name="dropdown"
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 transform -translate-y-2"
        enter-to-class="opacity-100 transform translate-y-0"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 transform translate-y-0"
        leave-to-class="opacity-0 transform -translate-y-2"
      >
        <div
          class="absolute w-full mt-1.5 bg-white/[0.03] backdrop-blur-md border border-white/[0.06] rounded-2xl shadow-lg shadow-black/20 z-10"
        >
          <div class="px-4 py-4 flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-zinc-500 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
            <div>
              <p class="text-sm text-zinc-300">
                No results for <span class="font-medium text-white">"{{ query }}"</span>
              </p>
              <p class="text-xs text-zinc-500 mt-1">
                The item may not be indexed yet, or try a different search term.
              </p>
            </div>
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
