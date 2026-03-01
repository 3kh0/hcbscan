<script setup lang="ts">
  const { data, error } = await useFetch("/api/stats/detailed");

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

  const maxVolume = computed(() => {
    if (!data.value?.activityVolume?.length) return 1;
    return Math.max(...data.value.activityVolume.map((d) => d.count));
  });

  const formatDay = (day: string) => {
    const d = new Date(day);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  useSeoMeta({
    title: "Network Stats - HCBScan",
    ogTitle: "Network Stats - HCBScan",
    description:
      "Global statistics and leaderboards for HCB organizations and users.",
    ogDescription:
      "Global statistics and leaderboards for HCB organizations and users.",
    ogImage: "https://hcbscan.3kh0.net/readme.png",
    twitterImage: "https://hcbscan.3kh0.net/readme.png",
  });
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-3xl font-bold">Network Stats</h1>
    <p class="text-zinc-400">Note that this data only accounts for organizations that have been indexed by HCBScan. There is a margin of error in the data due to indexing delays and incomplete data collection due to quirks in the HCB API.</p>

    <div v-if="error">
      <ErrorBanner :message="error.message" />
    </div>

    <template v-else-if="data">
      <!-- summary cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-4">
        <div class="bg-zinc-900 p-4 rounded-lg">
          <p class="text-sm text-zinc-400 mb-1">Total Balance</p>
          <p class="text-2xl font-bold">
            {{ fixMoney(data.balance) }}
          </p>
        </div>
        <div class="bg-zinc-900 p-4 rounded-lg">
          <p class="text-sm text-zinc-400 mb-1">Indexed Organizations</p>
          <p class="text-2xl font-bold">
            {{ data.accounts.toLocaleString() }}
          </p>
        </div>
        <div class="bg-zinc-900 p-4 rounded-lg">
          <div class="flex items-center gap-2">
            <p class="text-sm text-zinc-400 mb-1">Activities (7d)</p>
            <div v-if="change !== 0" :class="change > 0 ? 'text-green-500' : 'text-rose-500'"
              class="text-xs mb-1 font-medium">
              {{ change > 0 ? "+" : "" }}{{ change.toFixed(0) }}%
            </div>
          </div>
          <p class="text-2xl font-bold">
            {{ data.volume7d.toLocaleString() }}
          </p>
        </div>
      </div>

      <div v-if="data.activityVolume.length" class="bg-zinc-900 p-6 rounded-lg">
        <h2 class="text-xl font-semibold mb-4">
          Activity Volume (Last 30 Days)
        </h2>
        <div class="flex items-end gap-0.5 h-40">
          <div v-for="e in data.activityVolume" :key="e.day" class="flex-1 h-full group relative flex items-end">
            <div class="bg-blue-500 rounded-t hover:bg-blue-400 transition-colors w-full" :style="{
                height: `${(e.count / maxVolume) * 100}%`,
                minHeight: e.count > 0 ? '2px' : '0',
              }"></div>
            <div
              class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-zinc-700 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
              {{ formatDay(e.day) }}: {{ e.count.toLocaleString() }}
            </div>
          </div>
        </div>
        <div class="flex justify-between mt-2 text-xs text-zinc-500">
          <span>{{
            formatDay(data.activityVolume[0]?.day)
            }}</span>
          <span>{{
            formatDay(
            data.activityVolume[data.activityVolume.length - 1]?.day
            )
            }}</span>
        </div>
      </div>

      <!-- top orgs by balance -->
      <div class="bg-zinc-900 rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4">Top Organizations by Balance</h2>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="text-left text-zinc-400 text-sm">
                <th class="pb-3">#</th>
                <th class="pb-3">Organization</th>
                <th class="pb-3">Category</th>
                <th class="pb-3 text-right">Balance</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-700">
              <tr v-for="o in data.topOrgs" :key="o.id" class="text-sm">
                <td class="py-3 text-zinc-500">{{ o.rank }}</td>
                <td class="py-3">
                  <NuxtLink :to="`/app/org/${o.id}`" class="text-blue-400 hover:underline">
                    {{ o.name }}
                  </NuxtLink>
                </td>
                <td class="py-3 text-zinc-400">
                  {{ o.category || "—" }}
                </td>
                <td class="py-3 text-right font-mono">
                  {{ fixMoney(o.balance) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- most active orgs + users side by side -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- most active orgs -->
        <div class="bg-zinc-900 rounded-lg p-6">
          <h2 class="text-xl font-semibold mb-4">
            Most Active Orgs (7d)
          </h2>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="text-left text-zinc-400 text-sm">
                  <th class="pb-3">#</th>
                  <th class="pb-3">Organization</th>
                  <th class="pb-3 text-right">Activities</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-700">
                <tr v-for="o in data.mostActiveOrgs" :key="o.id" class="text-sm h-13">
                  <td class="py-3 text-zinc-500">{{ o.rank }}</td>
                  <td class="py-3">
                    <NuxtLink :to="`/app/org/${o.id}`" class="text-blue-400 hover:underline">
                      {{ o.name }}
                    </NuxtLink>
                  </td>
                  <td class="py-3 text-right font-mono">
                    {{ o.activityCount.toLocaleString() }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- most active users -->
        <div class="bg-zinc-900 rounded-lg p-6">
          <h2 class="text-xl font-semibold mb-4">
            Most Active Users (7d)
          </h2>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="text-left text-zinc-400 text-sm">
                  <th class="pb-3">#</th>
                  <th class="pb-3">User</th>
                  <th class="pb-3 text-right">Activities</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-700">
                <tr v-for="u in data.mostActiveUsers" :key="u.id" class="text-sm h-13">
                  <td class="py-3 text-zinc-500">{{ u.rank }}</td>
                  <td class="py-3">
                    <NuxtLink :to="`/app/usr/${u.id}`" class="text-blue-400 hover:underline">
                      <div class="flex items-center gap-2">
                        <SafeNuxtImg v-if="u.photo" :src="u.photo" :alt="u.name" width="24" height="24"
                          class="w-6 h-6 rounded-full" />
                        <span>{{ u.name }}</span>
                      </div>
                    </NuxtLink>
                  </td>
                  <td class="py-3 text-right font-mono">
                    {{ u.activityCount.toLocaleString() }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
