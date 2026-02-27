<script setup lang="ts">
  import RecentActivites from "~/components/recentActivites.vue";
  import SearchBar from "~/components/searchBar.vue";

  const { data, error } = await useFetch("/api/stats");

  const change = computed(() => {
    if (data.value?.volume7d && data.value?.volumePrevious) {
      return (
        ((data.value.volume7d - data.value.volumePrevious) /
          data.value.volumePrevious) *
        100
      );
    }
    return 0;
  });

  useHead({
    title: "HCBScan",
    meta: [
      {
        name: "description",
        content:
          "The HCB Explorer -  The first public explorer for HCB transactions and organizations. ",
      },
    ],
  });
</script>

<template>
  <div>
    <!-- Hero -->
    <div class="pt-2 pb-6">
      <h2 class="text-3xl font-bold tracking-tight">Explore HCB</h2>
      <p class="text-zinc-400 mt-1 text-sm">
        Search across all indexed organizations and users on HCB.
      </p>
    </div>

    <!-- Search bar -->
    <SearchBar />

    <div v-if="error" class="mb-4">
      <ErrorBanner :message="error.message" />
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-white/[0.03] backdrop-blur-sm p-5 rounded-2xl border border-white/[0.06] shadow-lg shadow-black/20">
        <div class="flex items-center gap-2.5 mb-3">
          <div class="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-sm text-zinc-400">Total Balance</p>
        </div>
        <p class="text-3xl font-bold tracking-tight tabular-nums">
          {{ data?.balance ? fixMoney(data.balance) : "—" }}
        </p>
      </div>

      <div class="bg-white/[0.03] backdrop-blur-sm p-5 rounded-2xl border border-white/[0.06] shadow-lg shadow-black/20">
        <div class="flex items-center gap-2.5 mb-3">
          <div class="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <p class="text-sm text-zinc-400">Activities (7d)</p>
          <span
            v-if="change !== 0"
            :class="change > 0 ? 'text-green-400' : 'text-rose-400'"
            class="text-xs font-medium ml-auto px-2 py-0.5 rounded-full"
            :style="change > 0 ? 'background: rgba(34,197,94,0.08)' : 'background: rgba(244,63,94,0.08)'"
          >
            {{ change > 0 ? "↑" : "↓" }} {{ Math.abs(change).toFixed(0) }}%
          </span>
        </div>
        <p class="text-3xl font-bold tracking-tight tabular-nums">
          {{ (data?.volume7d ?? "—").toLocaleString() }}
        </p>
        <p v-if="change !== 0" class="text-xs text-zinc-500 mt-2">
          vs {{ (data?.volumePrevious ?? "—").toLocaleString() }} prev.
        </p>
      </div>

      <div class="bg-white/[0.03] backdrop-blur-sm p-5 rounded-2xl border border-white/[0.06] shadow-lg shadow-black/20">
        <div class="flex items-center gap-2.5 mb-3">
          <div class="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <p class="text-sm text-zinc-400">Organizations</p>
        </div>
        <p class="text-3xl font-bold tracking-tight tabular-nums">
          {{ (data?.accounts ?? "—").toLocaleString() }}
        </p>
      </div>
    </div>

    <!-- Recent activities -->
    <RecentActivites />
  </div>
</template>
