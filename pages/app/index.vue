<script setup lang="ts">
const stats = reactive({
  balance: "-",
  volume7d: "-",
  volumePast: "-",
  accounts: "-",
  c: 0,
});

import { buildApiUrl } from "~/utils/apiConfig";
import { supabase } from "~/utils/supabase/supabase";
import RecentActivites from "~/components/recentActivites.vue";
import SearchBar from "~/components/searchBar.vue";

const table = getApiDomain().replace(/^https?:\/\//, ""); // remove url junk
const loading = ref(true);
const error = ref<string | null>(null);

const c = (a: number, b: number) => {
  return ((a - b) / b) * 100;
};

const fetch = async () => {
  loading.value = true;
  try {
    // org count
    const { count, error: countError } = await supabase
      .from(table)
      .select("*", { count: "exact", head: true });
    if (countError)
      throw new Error(
        `Failed to fetch organization count: ${countError.message}`
      );
    stats.accounts = count || "-";

    // total value
    const { data: balanceData, error: balanceError } = await supabase.rpc(
      "sum_balance",
      {
        table_name: table,
      }
    );
    if (balanceError)
      throw new Error(`Failed to fetch total balance: ${balanceError.message}`);
    stats.balance = balanceData ? fixMoney(balanceData) : "-";

    const { data: volume, error: volumeError } = await supabase.rpc(
      "count_volume"
    );
    if (volumeError)
      throw new Error(`Failed to fetch 7-day volume: ${volumeError.message}`);
    stats.volume7d = volume || "-";

    const { data: volumePast, error: volumePastError } = await supabase.rpc(
      "count_volume_previous"
    );
    if (volumePastError)
      throw new Error(
        `Failed to fetch previous volume: ${volumePastError.message}`
      );
    stats.volumePast = volumePast || "-";

    if (volume && volumePast) {
      stats.c = c(volume, volumePast);
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : "An unknown error occurred.";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetch();
  const a = setInterval(fetch, 30000);

  onBeforeUnmount(() => {
    clearInterval(a);
  });
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
      <ErrorBanner :message="error" />
    </div>

    <!-- stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <div class="bg-zinc-900 p-4 rounded-lg">
        <p class="text-sm text-zinc-400 mb-1">Total Balance</p>
        <div v-if="loading" class="animate-pulse">
          <div class="h-8 bg-zinc-800 rounded w-2/4"></div>
        </div>
        <p v-else class="text-2xl font-bold">{{ stats.balance }}</p>
      </div>
      <div class="bg-zinc-900 p-4 rounded-lg">
        <div class="flex items-center gap-2">
          <p class="text-sm text-zinc-400 mb-1">Activities (7 days)</p>
          <div v-if="loading" class="animate-pulse">
            <div
              class="text-xs mb-1 font-medium bg-zinc-800 text-zinc-800 rounded h-4 w-24"
            ></div>
          </div>
          <div
            v-else-if="!loading && stats.c !== 0"
            :class="stats.c > 0 ? 'text-green-500' : 'text-rose-500'"
            class="text-xs mb-1 font-medium"
          >
            {{ stats.c > 0 ? "+" : "" }}{{ stats.c.toFixed(0) }}%
            {{ stats.c > 0 ? "up" : "down" }} from
            {{ stats.volumePast.toLocaleString() }}
          </div>
        </div>
        <div v-if="loading" class="animate-pulse">
          <div class="h-8 bg-zinc-800 rounded w-1/2"></div>
        </div>
        <p v-else class="text-2xl font-bold">
          {{ stats.volume7d.toLocaleString() }}
        </p>
      </div>
      <div class="bg-zinc-900 p-4 rounded-lg">
        <p class="text-sm text-zinc-400 mb-1">Indexed Organizations</p>
        <div v-if="loading" class="animate-pulse">
          <div class="h-8 bg-zinc-800 rounded w-1/2"></div>
        </div>
        <p v-else class="text-2xl font-bold">
          {{ stats.accounts.toLocaleString() }}
        </p>
      </div>
    </div>

    <!-- recent -->
    <RecentActivites />
  </div>
</template>
