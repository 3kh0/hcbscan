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

  type Style = { bg: string; text: string; icon: string };
  const actStyles: Record<string, Style> = {
    "raw_pending_stripe_transaction.create": {
      bg: "bg-purple-500/10",
      text: "text-purple-400",
      icon: "card",
    },
    "ach_transfer.create": {
      bg: "bg-blue-500/10",
      text: "text-blue-400",
      icon: "bank",
    },
    "ach_transfer.failed": {
      bg: "bg-red-500/10",
      text: "text-red-400",
      icon: "bank",
    },
    "ach_transfer.rejected": {
      bg: "bg-red-500/10",
      text: "text-red-400",
      icon: "bank",
    },
    "check_deposit.create": {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      icon: "document",
    },
    "increase_check.create": {
      bg: "bg-blue-500/10",
      text: "text-blue-400",
      icon: "mail",
    },
    "increase_check.rejected": {
      bg: "bg-red-500/10",
      text: "text-red-400",
      icon: "mail",
    },
    "comment.create": {
      bg: "bg-blue-500/10",
      text: "text-blue-400",
      icon: "chat",
    },
    "comment.destroy": {
      bg: "bg-red-500/10",
      text: "text-red-400",
      icon: "chat",
    },
    "comment.update": {
      bg: "bg-blue-500/10",
      text: "text-blue-400",
      icon: "chat",
    },
    "disbursement.create": {
      bg: "bg-orange-500/10",
      text: "text-orange-400",
      icon: "arrows",
    },
    "disbursement.rejected": {
      bg: "bg-red-500/10",
      text: "text-red-400",
      icon: "arrows",
    },
    "donation.paid": {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      icon: "heart",
    },
    "organizer_position_invite.create": {
      bg: "bg-blue-500/10",
      text: "text-blue-400",
      icon: "person",
    },
    "event.create": {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      icon: "building",
    },
    "invoice.create": {
      bg: "bg-blue-500/10",
      text: "text-blue-400",
      icon: "document",
    },
    "invoice.paid": {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      icon: "dollar",
    },
    "reimbursement_expense.approved": {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      icon: "check",
    },
    "reimbursement_report.approved": {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      icon: "check",
    },
    "reimbursement_report.create": {
      bg: "bg-blue-500/10",
      text: "text-blue-400",
      icon: "clipboard",
    },
    "reimbursement_report.review_requested": {
      bg: "bg-yellow-500/10",
      text: "text-yellow-400",
      icon: "eye",
    },
    "wire.create": {
      bg: "bg-blue-500/10",
      text: "text-blue-400",
      icon: "globe",
    },
    "wire.failed": {
      bg: "bg-red-500/10",
      text: "text-red-400",
      icon: "globe",
    },
    "wire.rejected": {
      bg: "bg-red-500/10",
      text: "text-red-400",
      icon: "globe",
    },
    "wise_transfer.create": {
      bg: "bg-blue-500/10",
      text: "text-blue-400",
      icon: "globe",
    },
    "wise_transfer.failed": {
      bg: "bg-red-500/10",
      text: "text-red-400",
      icon: "globe",
    },
    "wise_transfer.rejected": {
      bg: "bg-red-500/10",
      text: "text-red-400",
      icon: "globe",
    },
  };
  const actFallback: Style = {
    bg: "bg-zinc-500/10",
    text: "text-zinc-400",
    icon: "bolt",
  };
  const s = (k: string) => actStyles[k] ?? actFallback;

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
  <div class="mb-4">
    <div ref="searchCon" class="relative">
      <div
        v-if="!fetching"
        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
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
        v-else
        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
      >
        <Spinner :size="5" color="text-white" />
      </div>

      <div
        class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
      >
        <span
          v-show="!isFocused"
          class="px-2 py-0.5 text-xs rounded bg-zinc-700 text-zinc-400"
        >
          /
        </span>
      </div>

      <input
        id="search-input"
        v-model="query"
        type="text"
        class="block w-full bg-zinc-900 rounded-lg py-3 pl-10 pr-10 text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
        placeholder="Search for organizations, users, or activities on HCB..."
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
          class="absolute z-10 w-full mt-1 bg-zinc-800 rounded-lg shadow-lg overflow-hidden origin-top will-change-transform"
        >
          <div class="border-b border-zinc-700">
            <div class="flex">
              <button
                class="px-4 py-2 text-sm transition-colors"
                :class="
                  scope === 'all'
                    ? 'text-white border-b-2 border-blue-500'
                    : 'text-zinc-400 hover:text-white'
                "
                @click="setScope('all')"
              >
                All
              </button>
              <button
                class="px-4 py-2 text-sm transition-colors"
                :class="
                  scope === 'orgs'
                    ? 'text-white border-b-2 border-blue-500'
                    : 'text-zinc-400 hover:text-white'
                "
                @click="setScope('orgs')"
              >
                Organizations
              </button>
              <button
                class="px-4 py-2 text-sm transition-colors"
                :class="
                  scope === 'users'
                    ? 'text-white border-b-2 border-blue-500'
                    : 'text-zinc-400 hover:text-white'
                "
                @click="setScope('users')"
              >
                Users
              </button>
              <button
                class="px-4 py-2 text-sm transition-colors"
                :class="
                  scope === 'activities'
                    ? 'text-white border-b-2 border-blue-500'
                    : 'text-zinc-400 hover:text-white'
                "
                @click="setScope('activities')"
              >
                Activities
              </button>
            </div>
          </div>

          <div class="px-4 py-3 text-zinc-400">
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
            <p class="mt-2 text-xs text-zinc-500">
              <span class="bg-zinc-700 text-zinc-400 px-1.5 rounded">↑/↓</span>
              to navigate •
              <span class="bg-zinc-700 text-zinc-400 px-1.5 rounded">Tab</span>
              to cycle •
              <span class="bg-zinc-700 text-zinc-400 px-1.5 rounded"
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
          class="absolute z-10 w-full mt-1 bg-zinc-800 rounded-lg shadow-lg origin-top will-change-transform"
        >
          <div class="px-4 py-2 text-zinc-400 animate-pulse">Searching...</div>
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
          class="absolute w-full mt-1 bg-zinc-800 bg-opacity-80 backdrop-blur-md rounded-lg shadow-lg z-10 max-h-80 overflow-y-auto origin-top will-change-transform"
        >
          <div class="divide-y divide-zinc-800/50">
            <div
              v-if="scope === 'all' && orgResults.length > 0"
              class="px-4 py-2 text-xs font-semibold text-zinc-500 bg-zinc-800 sticky top-0"
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
                  ? 'bg-blue-900/40'
                  : 'hover:bg-zinc-800/40',
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
                    class="shrink-0 px-1.5 py-0.5 text-[10px] rounded-full bg-zinc-700 text-zinc-300"
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
                  <span class="text-xs text-zinc-500">{{ org.Slug }}</span>
                  <span class="text-zinc-700">·</span>
                  <span class="text-xs text-zinc-500 font-mono">{{
                    truncId(org["Organization ID"])
                  }}</span>
                  <span class="text-zinc-700">·</span>
                  <span class="text-xs text-zinc-500">{{
                    fmtDate(org.Added)
                  }}</span>
                </div>
              </div>
              <div class="shrink-0 text-right">
                <span
                  class="text-sm font-semibold tabular-nums text-emerald-400"
                >
                  {{ fixMoney(org.Balance) }}
                </span>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 shrink-0 text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all duration-150"
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
                'group flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors duration-150',
                selected ===
                (scope === 'all' ? orgResults.length + index : index)
                  ? 'bg-blue-900/40'
                  : 'hover:bg-zinc-800/40',
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
                    class="shrink-0 px-1.5 py-0.5 text-[10px] rounded-full bg-zinc-700 text-zinc-300"
                  >
                    {{ user.orgs?.length || 0 }} orgs
                  </span>
                </div>
                <div class="flex items-center gap-2 mt-0.5">
                  <span class="text-xs text-zinc-500 font-mono">{{
                    truncId(user.id)
                  }}</span>
                </div>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 shrink-0 text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all duration-150"
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
              class="px-4 py-2 text-xs font-semibold text-zinc-500 bg-zinc-800 sticky top-0"
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
                  ? 'bg-blue-900/40'
                  : 'hover:bg-zinc-800/40',
              ]"
              @mouseenter="
                selected =
                  scope === 'all'
                    ? orgResults.length + userResults.length + index
                    : index
              "
              @click="sendResult({ ...act, type: 'activity' })"
            >
              <div
                :class="[
                  'shrink-0 flex items-center justify-center w-8 h-8 rounded-lg',
                  s(act['Key']).bg,
                  s(act['Key']).text,
                ]"
              >
                <svg
                  v-if="s(act['Key']).icon === 'card'"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path
                    fill-rule="evenodd"
                    d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                    clip-rule="evenodd"
                  />
                </svg>
                <svg
                  v-else-if="s(act['Key']).icon === 'bank'"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10.496 2.132a1 1 0 00-.992 0l-7 4A1 1 0 003 8v1h14V8a1 1 0 00.496-1.868l-7-4zM5 11v5h2v-5H5zm4 0v5h2v-5H9zm4 0v5h2v-5h-2zM3 17a1 1 0 000 2h14a1 1 0 100-2H3z"
                    clip-rule="evenodd"
                  />
                </svg>
                <svg
                  v-else-if="s(act['Key']).icon === 'dollar'"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"
                  />
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                    clip-rule="evenodd"
                  />
                </svg>
                <svg
                  v-else-if="s(act['Key']).icon === 'check'"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                <svg
                  v-else-if="s(act['Key']).icon === 'document'"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                    clip-rule="evenodd"
                  />
                </svg>
                <svg
                  v-else-if="s(act['Key']).icon === 'mail'"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"
                  />
                  <path
                    d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"
                  />
                </svg>
                <svg
                  v-else-if="s(act['Key']).icon === 'chat'"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7z"
                    clip-rule="evenodd"
                  />
                </svg>
                <svg
                  v-else-if="s(act['Key']).icon === 'arrows'"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z"
                  />
                </svg>
                <svg
                  v-else-if="s(act['Key']).icon === 'heart'"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clip-rule="evenodd"
                  />
                </svg>
                <svg
                  v-else-if="s(act['Key']).icon === 'person'"
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
                <svg
                  v-else-if="s(act['Key']).icon === 'building'"
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
                <svg
                  v-else-if="s(act['Key']).icon === 'clipboard'"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path
                    d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"
                  />
                </svg>
                <svg
                  v-else-if="s(act['Key']).icon === 'globe'"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z"
                    clip-rule="evenodd"
                  />
                </svg>
                <svg
                  v-else-if="s(act['Key']).icon === 'eye'"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fill-rule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                <!-- Fallback bolt -->
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <!-- Content -->
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium truncate text-white">
                    {{ activityLabel(act["Key"]) }}
                  </span>
                </div>
                <div class="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span class="text-xs text-zinc-500 font-mono">{{
                    truncId(act["Activity ID"])
                  }}</span>
                  <span class="text-zinc-700">·</span>
                  <span class="text-xs text-zinc-500">{{
                    fmtDate(act["Created At"])
                  }}</span>
                  <template v-if="act['User Name']">
                    <span class="text-zinc-700">·</span>
                    <span class="text-xs text-zinc-500">{{
                      act["User Name"]
                    }}</span>
                  </template>
                </div>
              </div>
              <div
                v-if="act['Organization Name']"
                class="hidden sm:flex shrink-0 items-center gap-2 max-w-45"
              >
                <span class="text-sm text-zinc-400 truncate">{{
                  act["Organization Name"]
                }}</span>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 shrink-0 text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all duration-150"
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
          class="absolute w-full mt-1 bg-zinc-800 bg-opacity-80 backdrop-blur-md rounded-lg shadow-lg z-10 origin-top will-change-transform"
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

