<script setup lang="ts">
const stats = reactive({
  totalBalance: "-",
  volume7d: "-",
  totalAccounts: "-",
});
import { buildApiUrl } from "~/utils/apiConfig";
import { supabase } from "~/utils/supabase";
import RecentActivites from "~/components/recentActivites.vue";
import SearchBar from "~/components/searchBar.vue";

const supabaseTable = getApiDomain().replace(/^https?:\/\//, ""); // remove url junk

const fetch = async () => {
  // org count
  const { count } = await supabase
    .from(supabaseTable)
    .select("*", { count: "exact", head: true });
  stats.totalAccounts = count || "-";

  // total value
  const { data } = await supabase.rpc("sum_balance", {
    table_name: supabaseTable,
  });
  stats.totalBalance = fixMoney(data || "-");

  const { data: volumeData } = await supabase.rpc("count_volume");
  stats.volume7d = volumeData || "-";
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
      content: "The HCB Explorer",
    },
  ],
});
</script>

<template>
  <div>
    <!-- search bar -->
    <SearchBar />

    <!-- stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <div class="bg-zinc-900 p-4 rounded-lg">
        <p class="text-sm text-zinc-400 mb-1">Total Balance</p>
        <p class="text-2xl font-bold">{{ stats.totalBalance }}</p>
      </div>
      <div class="bg-zinc-900 p-4 rounded-lg">
        <p class="text-sm text-zinc-400 mb-1">Activities (7 days)</p>
        <p class="text-2xl font-bold">{{ stats.volume7d.toLocaleString() }}</p>
      </div>
      <div class="bg-zinc-900 p-4 rounded-lg">
        <p class="text-sm text-zinc-400 mb-1">Indexed Organizations</p>
        <p class="text-2xl font-bold">
          {{ stats.totalAccounts.toLocaleString() }}
        </p>
      </div>
    </div>

    <!-- recent -->
    <RecentActivites />
  </div>
</template>
