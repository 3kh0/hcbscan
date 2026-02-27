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
      <div class="bg-zinc-900 p-5 rounded-xl border border-zinc-800 ring-1 ring-white/5 border-l-2 border-l-green-500/40">
        <div class="flex items-center gap-2 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-xs font-medium text-zinc-400">Total Balance</p>
        </div>
        <p class="text-3xl font-bold tracking-tight tabular-nums">
          {{ data?.balance ? fixMoney(data.balance) : "—" }}
        </p>
      </div>

      <div class="bg-zinc-900 p-5 rounded-xl border border-zinc-800 ring-1 ring-white/5 border-l-2 border-l-green-500/40">
        <div class="flex items-center gap-2 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <p class="text-xs font-medium text-zinc-400">Activities (7 days)</p>
          <span
            v-if="change !== 0"
            :class="change > 0 ? 'bg-green-500/10 text-green-400' : 'bg-rose-500/10 text-rose-400'"
            class="text-xs font-medium px-1.5 py-0.5 rounded-full"
          >
            {{ change > 0 ? "▲" : "▼" }} {{ Math.abs(change).toFixed(0) }}%
          </span>
        </div>
        <p class="text-3xl font-bold tracking-tight tabular-nums">
          {{ (data?.volume7d ?? "—").toLocaleString() }}
        </p>
        <p v-if="change !== 0" class="text-xs text-zinc-500 mt-1">
          vs {{ (data?.volumePrevious ?? "—").toLocaleString() }} prev. period
        </p>
      </div>

      <div class="bg-zinc-900 p-5 rounded-xl border border-zinc-800 ring-1 ring-white/5 border-l-2 border-l-green-500/40">
        <div class="flex items-center gap-2 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p class="text-xs font-medium text-zinc-400">Indexed Organizations</p>
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
