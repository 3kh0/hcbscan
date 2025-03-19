<script setup lang="ts">
const stats = reactive({
  totalBalance: "-",
  volume24h: "-",
  totalAccounts: "-",
  activeToday: "-",
});
import { supabase } from "~/utils/supabase";
import { debounce } from "lodash"; // for search bar

interface Activity {
  id: string;
  key: string;
  created_at: string;
  user: {
    full_name: string;
    photo: string;
  } | null;
  organization: {
    name: string;
    logo: string | null;
  };
}

const acts = ref<Activity[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const query = ref("");
const results = ref([]);
const gettingResults = ref(false);
let isFocused = ref(false);

const searchOrgs = debounce(async (query: string) => {
  if (!query.trim()) {
    // no query
    gettingResults.value = false;
    results.value = [];
    return;
  }

  const { data, error } = await supabase
    .from("orgs")
    .select("*")
    .or(
      `Name.ilike.%${query}%,Slug.ilike.%${query}%,Organization ID.ilike.%${query}%,Category.ilike.%${query}%`
    )
    .limit(10);

  if (error) {
    console.error("fuck ", error);
    return;
  }

  results.value = data || [];
  gettingResults.value = false;
}, 300); // delay let the user finish typing before searching

watch(query, (newQuery) => {
  gettingResults.value = true;
  searchOrgs(newQuery);
});

const gimmeData = async () => {
  try {
    const response = await fetch(
      "https://hcb.hackclub.com/api/v3/activities?page=1&per_page=15",
      {
        headers: { Accept: "application/json" },
      }
    );
    const data = await response.json();
    acts.value = data;
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Something went wrong";
    console.error(error);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  gimmeData();

  // org count
  const { count } = await supabase
    .from("orgs")
    .select("*", { count: "exact", head: true });
  stats.totalAccounts = count || "-";

  // total value
  const { data, error } = await supabase.rpc("sum_balance");
  if (error) {
    console.error(error);
    stats.totalBalance = "-";
  } else {
    stats.totalBalance = fixMoney(data || "-");
  }

  // keep data fresh
  setInterval(() => {
    gimmeData();
  }, 30000);
});

onUnmounted(() => {
  clearInterval();
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
    <!-- search -->
    <div class="mb-4">
      <div class="relative">
        <!-- mag glass-->
        <div
          class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
          v-if="!gettingResults"
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
        <!-- spinner -->
        <div
          class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
          v-else
        >
          <svg
            class="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        <input
          v-model="query"
          @focus="isFocused = true"
          @blur="isFocused = false"
          type="text"
          class="block w-full bg-zinc-900 rounded-lg py-3 pl-10 pr-3 text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder="Search for organizations on HCB..."
        />
        <div
          v-if="isFocused && !gettingResults && !query"
          class="absolute z-10 w-full mt-1 bg-zinc-800 rounded-lg shadow-lg"
        >
          <div class="px-4 py-2 text-zinc-400">
            Welcome to HCBScan search! This is still being worked on, but for
            the time being, you can search for organizations by name, category,
            URL slug, or just the organization ID.
          </div>
        </div>
        <div>
          <div
            v-if="gettingResults"
            class="absolute z-10 w-full mt-1 bg-zinc-800 rounded-lg shadow-lg"
          >
            <div class="px-4 py-2 text-zinc-400 animate-pulse">
              Searching...
            </div>
          </div>
        </div>

        <!-- results -->
        <div
          v-if="results.length > 0"
          class="absolute w-full mt-1 bg-zinc-800 bg-opacity-80 backdrop-blur-md rounded-lg shadow-lg z-10"
        >
          <div
            v-for="org in results"
            :key="org['Organization ID']"
            class="px-4 py-2 hover:bg-zinc-700 cursor-pointer flex justify-between items-center rounded-lg transition duration-200 ease-in-out"
          >
            <NuxtLink
              :to="`/app/org/${org['Organization ID']}`"
              class="flex-grow"
            >
              <div>
                <div class="text-white font-semibold">{{ org.Name }}</div>
                <div class="text-zinc-400 text-sm">{{ org.Slug }}</div>
              </div>
            </NuxtLink>
            <div class="text-zinc-400 text-sm ml-4">
              Balance: {{ fixMoney(org.Balance) }}
            </div>
          </div>
        </div>
        <div
          v-else-if="!gettingResults && query"
          class="absolute w-full mt-1 bg-zinc-800 bg-opacity-80 backdrop-blur-md rounded-lg shadow-lg z-10"
        >
          <div class="px-4 py-2 text-red-400">
            Hmm, that did not pull up anything in the database. Either what you
            are looking for does not exist or it has not been indexed yet.
          </div>
        </div>
      </div>
    </div>

    <!-- stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <div class="bg-zinc-900 p-4 rounded-lg">
        <p class="text-sm text-zinc-400 mb-1">Total Balance</p>
        <p class="text-2xl font-bold">{{ stats.totalBalance }}</p>
      </div>
      <div class="bg-zinc-900 p-4 rounded-lg">
        <p class="text-sm text-zinc-400 mb-1">Activities (24h)</p>
        <p class="text-2xl font-bold">{{ stats.volume24h.toLocaleString() }}</p>
      </div>
      <div class="bg-zinc-900 p-4 rounded-lg">
        <p class="text-sm text-zinc-400 mb-1">Indexed Organizations</p>
        <p class="text-2xl font-bold">
          {{ stats.totalAccounts.toLocaleString() }}
        </p>
      </div>
    </div>

    <!-- recent -->
    <div class="bg-zinc-900 rounded-lg p-6">
      <h2 class="text-xl font-semibold mb-4">Recent Activities</h2>
      <p class="text-sm text-zinc-400 mb-4">
        Only showing recent activities from HCB organizations that are in
        Transparency Mode and have opted in to public listing.
      </p>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="text-left text-zinc-400 text-sm">
              <th class="pb-4">ID</th>
              <th class="pb-4">Action</th>
              <th class="pb-4">User</th>
              <th class="pb-4">Organization</th>
              <th class="pb-4">Time</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-700">
            <tr v-if="loading" class="text-sm">
              <td colspan="5" class="py-4 text-center text-zinc-400">
                <div
                  v-if="loading"
                  class="flex flex-col items-center justify-center py-12"
                >
                  <svg
                    class="animate-spin h-8 w-8 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <p class="mt-4 text-white animate-pulse">
                    Loading activities...
                  </p>
                </div>
              </td>
            </tr>
            <tr
              v-else
              v-for="activity in acts"
              :key="activity.id"
              class="text-sm"
            >
              <td class="py-4">
                <NuxtLink
                  :to="`/app/act/${activity.id}`"
                  class="text-blue-400 hover:underline font-mono"
                  >{{ activity.id }}</NuxtLink
                >
              </td>
              <td class="py-4">{{ activity.key }}</td>
              <td class="py-4">
                <div v-if="activity.user" class="flex items-center gap-2">
                  <img
                    :src="activity.user.photo"
                    :alt="activity.user.full_name"
                    class="w-6 h-6 rounded-full"
                  />
                  <span>{{ activity.user.full_name }}</span>
                </div>
                <span v-else class="text-zinc-500">System</span>
              </td>
              <td class="py-4">
                <NuxtLink
                  :to="`/app/org/${activity.organization.id}`"
                  class="text-blue-400 hover:underline"
                >
                  <div class="flex items-center gap-2">
                    <img
                      v-if="activity.organization.logo"
                      :src="activity.organization.logo"
                      :alt="activity.organization.name"
                      class="w-6 h-6 rounded-full"
                    />
                    <span> {{ activity.organization.name }}</span>
                  </div>
                </NuxtLink>
              </td>
              <td class="py-4 text-zinc-400">
                <span :title="date(activity.created_at)">
                  {{ relativeTime(activity.created_at) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="text-center mt-4">
        <NuxtLink to="/app/acts" class="text-blue-400 hover:underline"
          >View all transactions</NuxtLink
        >
      </div>
    </div>
  </div>
</template>
