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

  useSeoMeta({
    title: "HCBScan - The HCB Explorer",
    ogTitle: "HCBScan - The HCB Explorer",
    description:
      "The first public explorer for HCB transactions and organizations.",
    ogDescription:
      "The first public explorer for HCB transactions and organizations.",
    ogImage: "https://hcbscan.3kh0.net/readme.png",
    twitterImage: "https://hcbscan.3kh0.net/readme.png",
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
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
      <div
        v-for="(card, i) in [
          { label: 'Total Balance', value: data?.balance ? fixMoney(data.balance) : '-' },
          { label: null, value: null },
          { label: 'Indexed Organizations', value: (data?.accounts ?? '-').toLocaleString() },
        ]"
        :key="i"
        class="bg-zinc-900 p-4 rounded-lg animate-[fade-slide-up_300ms_ease-out_both]"
        :style="{ animationDelay: `${i * 75}ms` }"
      >
        <template v-if="i === 1">
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
        </template>
        <template v-else>
          <p class="text-sm text-zinc-400 mb-1">{{ card.label }}</p>
          <p class="text-2xl font-bold">{{ card.value }}</p>
        </template>
      </div>
    </div>
    <NuxtLink to="/app/stats" class="flex items-center justify-center mb-4">
      <p class="text-xs text-zinc-400 mb-1">View Detailed Stats</p>
    </NuxtLink>

    <!-- recent -->
    <RecentActivites />
  </div>
</template>
