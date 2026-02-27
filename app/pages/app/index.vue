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
    <!-- search bar -->
    <SearchBar />

    <div v-if="error" class="mb-4">
      <ErrorBanner :message="error.message" />
    </div>

    <!-- stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <div class="bg-zinc-900 p-4 rounded-lg">
        <p class="text-sm text-zinc-400 mb-1">Total Balance</p>
        <p class="text-2xl font-bold">
          {{ data?.balance ? fixMoney(data.balance) : "-" }}
        </p>
      </div>
      <div class="bg-zinc-900 p-4 rounded-lg">
        <div class="flex items-center gap-2">
          <p class="text-sm text-zinc-400 mb-1">Activities (7 days)</p>
          <div
            v-if="change !== 0"
            :class="change > 0 ? 'text-green-500' : 'text-rose-500'"
            class="text-xs mb-1 font-medium"
          >
            {{ change > 0 ? "+" : "" }}{{ change.toFixed(0) }}%
            {{ change > 0 ? "up" : "down" }} from
            {{ (data?.volumePrevious ?? "-").toLocaleString() }}
          </div>
        </div>
        <p class="text-2xl font-bold">
          {{ (data?.volume7d ?? "-").toLocaleString() }}
        </p>
      </div>
      <div class="bg-zinc-900 p-4 rounded-lg">
        <p class="text-sm text-zinc-400 mb-1">Indexed Organizations</p>
        <p class="text-2xl font-bold">
          {{ (data?.accounts ?? "-").toLocaleString() }}
        </p>
      </div>
    </div>

    <!-- recent -->
    <RecentActivites />
  </div>
</template>
