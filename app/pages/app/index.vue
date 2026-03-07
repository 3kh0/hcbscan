<script setup lang="ts">
  import RecentActivites from "~/components/recentActivites.vue";

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
    ogUrl: "https://hcbscan.3kh0.net/app",
    ogImage: "https://hcbscan.3kh0.net/readme.png",
    twitterImage: "https://hcbscan.3kh0.net/readme.png",
  });
</script>

<template>
  <div>
    <div v-if="error" class="mb-4">
      <ErrorBanner :message="error.message" />
    </div>

    <!-- stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
      <UStatCard
        label="Total Balance"
        :value="data?.balance ? fixMoney(data.balance) : '-'"
        :delay="0"
      />
      <UStatCard
        label="Activities (7 days)"
        :value="(data?.volume7d ?? '-').toLocaleString()"
        :change="change"
        :delay="75"
      >
        <p v-if="change !== 0" class="text-xs text-text-muted mt-1">
          from {{ (data?.volumePrevious ?? "-").toLocaleString() }}
        </p>
      </UStatCard>
      <UStatCard
        label="Indexed Organizations"
        :value="(data?.accounts ?? '-').toLocaleString()"
        :delay="150"
      />
    </div>
    <NuxtLink to="/app/stats" class="flex items-center justify-center mb-4">
      <p class="text-xs text-text-muted mb-1">View Detailed Stats</p>
    </NuxtLink>

    <!-- recent -->
    <RecentActivites />
  </div>
</template>
