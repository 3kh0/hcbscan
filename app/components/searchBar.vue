<script setup lang="ts">
  import _ from "lodash";
  import { onClickOutside } from "@vueuse/core";

  const error = ref<string | null>(null);
  const query = ref("");
  const orgResults = ref([]);
  const userResults = ref([]);
  const actResults = ref([]);
  const fetching = ref(false);
  const isFocused = ref(false);
  const selected = ref(-1);
  const searchCon = ref(null);
  const scope = ref("all");
  const results = computed(() => {
    if (scope.value === "orgs") return orgResults.value;
    if (scope.value === "users") return userResults.value;
    if (scope.value === "activities") return actResults.value;
    return [
      ...orgResults.value.map((org) => ({ ...org, type: "org" })),
      ...userResults.value.map((user) => ({ ...user, type: "user" })),
      ...actResults.value.map((act) => ({ ...act, type: "activity" })),
    ];
  });

  const truncId = (id: string) =>
    !id || id.length <= 12 ? id : `${id.slice(0, 6)}…${id.slice(-4)}`;

  function fmtDate(v: string) {
    const d = new Date(v);
    const sec = Math.floor((Date.now() - d.getTime()) / 1000);
    if (sec < 60) return `${sec}s ago`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hrs = Math.floor(min / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year:
        d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    });
  }

  const search = _.debounce(async (query) => {
    if (!query.trim()) {
      fetching.value = false;
      orgResults.value = [];
      userResults.value = [];
      actResults.value = [];
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
      actResults.value = data.activities || [];
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
    if (result.type === "activity") {
      router.push(`/app/act/${result["Activity ID"]}`);
    } else if (result.type === "user" || result.id) {
      router.push(`/app/usr/${result.id}`);
    } else {
      router.push(`/app/org/${result["Organization ID"]}`);
    }

    query.value = "";
    orgResults.value = [];
    userResults.value = [];
    actResults.value = [];
    selected.value = -1;
    isFocused.value = false;
  };

  const goResult = () => {
    nextTick(() => {
      const el = document.getElementById(`search-result-${selected.value}`);
      if (el) el.scrollIntoView({ block: "nearest" });
    });
  };

  const setScope = (type) => {
    scope.value = type;
    if (query.value) search(query.value);
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
  <div ref="searchCon" class="relative">
    <div
      v-if="!fetching"
      class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
    >
      <svg
        class="h-4 w-4 text-text-muted"
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
      class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
    >
      <Spinner :size="4" color="text-text-secondary" />
    </div>

    <div
      class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
    >
      <span
        v-show="!isFocused"
        class="px-1.5 py-0.5 text-[10px] font-mono rounded border border-border bg-surface-1 text-text-muted"
      >
        /
      </span>
    </div>

    <input
      id="search-input"
      v-model="query"
      type="text"
      class="block w-full bg-surface-1 border border-border rounded-lg py-2 pl-9 pr-9 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-surface-3 focus:ring-1 focus:ring-surface-3 transition"
      placeholder="Search orgs, users, activities..."
      autocomplete="off"
      @focus="f"
      @blur="b"
      @keydown="k"
    />
    <transition
      enter-active-class="transition ease-out duration-150"
      enter-from-class="opacity-0 -translate-y-1 scale-[0.98]"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition ease-out duration-100"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 -translate-y-1 scale-[0.98]"
    >
      <div
        v-if="isFocused && !query"
        class="absolute z-10 w-full mt-1.5 bg-surface-1/95 backdrop-blur-md rounded-lg shadow-lg border border-border overflow-hidden origin-top will-change-transform"
      >
        <div class="border-b border-border">
          <div class="flex">
            <button
              class="px-4 py-2 text-sm transition-colors"
              :class="
                scope === 'all'
                  ? 'text-white border-b-2 border-accent'
                  : 'text-text-secondary hover:text-white'
              "
              @click="setScope('all')"
            >
              All
            </button>
            <button
              class="px-4 py-2 text-sm transition-colors"
              :class="
                scope === 'orgs'
                  ? 'text-white border-b-2 border-accent'
                  : 'text-text-secondary hover:text-white'
              "
              @click="setScope('orgs')"
            >
              Organizations
            </button>
            <button
              class="px-4 py-2 text-sm transition-colors"
              :class="
                scope === 'users'
                  ? 'text-white border-b-2 border-accent'
                  : 'text-text-secondary hover:text-white'
              "
              @click="setScope('users')"
            >
              Users
            </button>
            <button
              class="px-4 py-2 text-sm transition-colors"
              :class="
                scope === 'activities'
                  ? 'text-white border-b-2 border-accent'
                  : 'text-text-secondary hover:text-white'
              "
              @click="setScope('activities')"
            >
              Activities
            </button>
          </div>
        </div>

        <div class="px-4 py-3 text-text-secondary">
          <p>Start typing to search. You can search for:</p>
          <ul
            v-if="scope !== 'users' && scope !== 'activities'"
            class="mt-1 text-sm list-disc pl-5 space-y-1"
          >
            <li>Organization name</li>
            <li>Category</li>
            <li>URL slug</li>
            <li>Organization ID</li>
          </ul>
          <ul
            v-if="scope !== 'orgs' && scope !== 'activities'"
            class="mt-1 text-sm list-disc pl-5 space-y-1"
          >
            <li>User name</li>
            <li>User ID</li>
          </ul>
          <ul
            v-if="scope !== 'orgs' && scope !== 'users'"
            class="mt-1 text-sm list-disc pl-5 space-y-1"
          >
            <li>Activity ID</li>
            <li>Action type</li>
            <li>User name</li>
            <li>Organization name</li>
          </ul>
          <p class="mt-2 text-xs text-text-muted">
            <span class="bg-surface-2 text-text-secondary px-1.5 rounded"
              >↑/↓</span
            >
            to navigate •
            <span class="bg-surface-2 text-text-secondary px-1.5 rounded"
              >Tab</span
            >
            to cycle •
            <span class="bg-surface-2 text-text-secondary px-1.5 rounded"
              >Enter</span
            >
            to select
          </p>
        </div>
      </div>
    </transition>

    <transition
      enter-active-class="transition ease-out duration-150"
      enter-from-class="opacity-0 -translate-y-1 scale-[0.98]"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition ease-out duration-100"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 -translate-y-1 scale-[0.98]"
    >
      <div
        v-if="fetching && isFocused"
        class="absolute z-10 w-full mt-1.5 bg-surface-1/95 backdrop-blur-md rounded-lg shadow-lg border border-border origin-top will-change-transform"
      >
        <div class="px-4 py-2 text-sm text-text-secondary animate-pulse">
          Searching...
        </div>
      </div>
    </transition>

    <transition
      v-if="results.length > 0 && isFocused"
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 -translate-y-1 scale-[0.98]"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition ease-out duration-150"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 -translate-y-1 scale-[0.98]"
    >
      <div
        class="absolute w-full mt-1.5 bg-surface-1/95 backdrop-blur-md rounded-lg shadow-lg border border-border z-10 max-h-80 overflow-y-auto origin-top will-change-transform"
      >
        <div class="divide-y divide-border">
          <div
            v-if="scope === 'all' && orgResults.length > 0"
            class="px-4 py-2 text-xs font-semibold text-text-muted bg-surface-2 sticky top-0"
          >
            Organizations
          </div>
          <div
            v-for="(org, index) in scope === 'all'
              ? orgResults
              : scope === 'orgs'
                ? results
                : []"
            :id="`search-result-${scope === 'all' ? index : index}`"
            :key="'org_' + org['Organization ID']"
            :class="[
              'group flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors duration-150',
              selected === (scope === 'all' ? index : index)
                ? 'bg-surface-2'
                : 'hover:bg-surface-2/60',
            ]"
            @mouseenter="selected = scope === 'all' ? index : index"
            @click="sendResult({ ...org, type: 'org' })"
          >
            <div
              class="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium truncate text-white">
                  {{ org.Name }}
                </span>
                <span
                  v-if="org.Category"
                  class="shrink-0 px-1.5 py-0.5 text-[10px] rounded-full bg-surface-2 text-zinc-300"
                >
                  {{ org.Category }}
                </span>
                <span
                  v-if="org['Frozen At']"
                  class="shrink-0 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-red-500/10 text-red-400 border border-red-500/20"
                >
                  Frozen
                </span>
              </div>
              <div class="flex items-center gap-2 mt-0.5 flex-wrap">
                <span class="text-xs text-text-muted">{{ org.Slug }}</span>
                <span class="text-surface-3">·</span>
                <span class="text-xs text-text-muted font-mono">{{
                  truncId(org["Organization ID"])
                }}</span>
                <span class="text-surface-3">·</span>
                <span class="text-xs text-text-muted">{{
                  fmtDate(org.Added)
                }}</span>
              </div>
            </div>
            <div class="shrink-0 text-right">
              <span class="text-sm font-semibold tabular-nums text-emerald-400">
                {{ fixMoney(org.Balance) }}
              </span>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 shrink-0 text-text-muted group-hover:text-text-secondary group-hover:translate-x-0.5 transition-all duration-150"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </div>

          <div
            v-if="scope === 'all' && userResults.length > 0"
            class="px-4 py-2 text-xs font-semibold text-text-muted bg-surface-2 sticky top-0"
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
              'group flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors duration-150',
              selected === (scope === 'all' ? orgResults.length + index : index)
                ? 'bg-surface-2'
                : 'hover:bg-surface-2/60',
            ]"
            @mouseenter="
              selected = scope === 'all' ? orgResults.length + index : index
            "
            @click="sendResult({ ...user, type: 'user' })"
          >
            <div v-if="user.avatar" class="shrink-0">
              <SafeNuxtImg
                :src="user.avatar"
                alt="User Avatar"
                width="32"
                height="32"
                class="w-8 h-8 rounded-lg object-cover"
              />
            </div>
            <div
              v-else
              class="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium truncate text-white">
                  {{ user.name }}
                </span>
                <span
                  class="shrink-0 px-1.5 py-0.5 text-[10px] rounded-full bg-surface-2 text-zinc-300"
                >
                  {{ user.orgs?.length || 0 }} orgs
                </span>
              </div>
              <div class="flex items-center gap-2 mt-0.5">
                <span class="text-xs text-text-muted font-mono">{{
                  truncId(user.id)
                }}</span>
              </div>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 shrink-0 text-text-muted group-hover:text-text-secondary group-hover:translate-x-0.5 transition-all duration-150"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </div>

          <div
            v-if="scope === 'all' && actResults.length > 0"
            class="px-4 py-2 text-xs font-semibold text-text-muted bg-surface-2 sticky top-0"
          >
            Activities
          </div>
          <div
            v-for="(act, index) in scope === 'all'
              ? actResults
              : scope === 'activities'
                ? results
                : []"
            :id="`search-result-${
              scope === 'all'
                ? orgResults.length + userResults.length + index
                : index
            }`"
            :key="'act_' + act['Activity ID']"
            :class="[
              'group flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors duration-150',
              selected ===
              (scope === 'all'
                ? orgResults.length + userResults.length + index
                : index)
                ? 'bg-surface-2'
                : 'hover:bg-surface-2/60',
            ]"
            @mouseenter="
              selected =
                scope === 'all'
                  ? orgResults.length + userResults.length + index
                  : index
            "
            @click="sendResult({ ...act, type: 'activity' })"
          >
            <UActivityIcon :activity-key="act['Key']" />
            <!-- Content -->
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium truncate text-white">
                  {{ activityLabel(act["Key"]) }}
                </span>
              </div>
              <div class="flex items-center gap-2 mt-0.5 flex-wrap">
                <span class="text-xs text-text-muted font-mono">{{
                  truncId(act["Activity ID"])
                }}</span>
                <span class="text-surface-3">·</span>
                <span class="text-xs text-text-muted">{{
                  fmtDate(act["Created At"])
                }}</span>
                <template v-if="act['User Name']">
                  <span class="text-surface-3">·</span>
                  <span class="text-xs text-text-muted">{{
                    act["User Name"]
                  }}</span>
                </template>
              </div>
            </div>
            <div
              v-if="act['Organization Name']"
              class="hidden sm:flex shrink-0 items-center gap-2 max-w-45"
            >
              <span class="text-sm text-text-secondary truncate">{{
                act["Organization Name"]
              }}</span>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 shrink-0 text-text-muted group-hover:text-text-secondary group-hover:translate-x-0.5 transition-all duration-150"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>
    </transition>

    <transition
      v-else-if="!fetching && query && isFocused && results.length === 0"
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 -translate-y-1 scale-[0.98]"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition ease-out duration-150"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 -translate-y-1 scale-[0.98]"
    >
      <div
        class="absolute w-full mt-1.5 bg-surface-1/95 backdrop-blur-md rounded-lg shadow-lg border border-border z-10 origin-top will-change-transform"
      >
        <div class="px-4 py-3 text-red-400">
          <p>
            We looked everywhere but we can't find anything with the query
            <span class="font-semibold">{{ query }}</span>
          </p>
          <p class="text-sm text-text-secondary mt-1">
            This could be because the item is not indexed yet, it does not
            exist, or you made a typo looking for something else.
          </p>
        </div>
      </div>
    </transition>
  </div>
</template>
