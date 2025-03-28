<script setup lang="ts">
import { buildApiUrl, getApiDomain } from "~/utils/apiConfig";
import { supabase } from "~/utils/supabase";

interface Activity {
  "Activity ID": string;
  Key: string;
  "Created At": string;
  "User ID": string | null;
  "User Name": string | null;
  "User Photo": string | null;
  "Organization ID": string | null;
  "Organization Name": string | null;
  "Organization Logo": string | null;
}

function t(dbActivity: Activity) {
  return {
    id: dbActivity["Activity ID"],
    key: dbActivity["Key"],
    created_at: dbActivity["Created At"],
    user: dbActivity["User ID"]
      ? {
          id: dbActivity["User ID"],
          full_name: dbActivity["User Name"],
          photo: dbActivity["User Photo"],
        }
      : null,
    organization: {
      id: dbActivity["Organization ID"],
      name: dbActivity["Organization Name"],
      logo: dbActivity["Organization Logo"],
    },
  };
}

const acts = ref([]);
const loading = ref(true);
const re = ref(false);
const error = ref<string | null>(null);
const isMain = getApiDomain().includes("hcb.hackclub.com");
const maxActs = 25;

const fetchActivities = async (isInitialLoad = false) => {
  if (isInitialLoad) {
    loading.value = true;
  } else {
    re.value = true;
  }

  error.value = null;

  try {
    let newActs = [];

    if (isMain) {
      console.log("Fetching activities from cache...");
      const { data, error: fetchError } = await supabase
        .from("hcb.hackclub.com-acts")
        .select("*")
        .order("Created At", { ascending: false })
        .limit(maxActs);

      if (fetchError) {
        console.error("Supabase fetch error:", fetchError);
        throw new Error(fetchError.message);
      }
      if (!data) {
        console.error("No activities found in cache.");
        throw new Error("No activities found in cache.");
      }
      newActs = data.map(t);
    } else {
      console.log("Fetching activities from API...");
      await fetch(buildApiUrl(`api/v3/activities?page=1&per_page=${maxActs}`));

      if (!response.ok) {
        console.error(
          "API response error:",
          response.status,
          response.statusText
        );
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      try {
        newActs = await response.json();
      } catch (jsonError) {
        console.error("Error parsing JSON response:", jsonError);
        throw new Error("Failed to parse API response as JSON.");
      }
    }

    if (isInitialLoad || acts.value.length === 0) {
      acts.value = newActs;
    } else {
      const currentIds = new Set(acts.value.map((act) => act.id));
      const newItems = newActs.filter((act) => !currentIds.has(act.id));

      if (newItems.length > 0) {
        acts.value = [...newItems, ...acts.value];
        if (acts.value.length > maxActs) {
          acts.value = acts.value.slice(0, maxActs);
        }
      }
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Unknown error occurred.";
    console.error("Error loading activities:", e);
  } finally {
    loading.value = false;
    re.value = false;
  }
};

onMounted(() => {
  fetchActivities(true);
  const i = setInterval(() => {
    if (!loading.value && !re.value) {
      fetchActivities(false);
    }
  }, 30000);

  onUnmounted(() => {
    clearInterval(i);
  });
});
</script>

<template>
  <div class="bg-zinc-900 rounded-lg p-6">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">Recent Activities</h2>
      <span v-if="re" class="text-xs text-blue-400 animate-pulse"
        >Refreshing...</span
      >
    </div>
    <p class="text-sm text-zinc-400 mb-4">
      Here are the most recent activities in all of HCB, auto refreshing every
      30 seconds.
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
              <div class="flex flex-col items-center justify-center py-12">
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
          <tr v-else-if="error" class="text-sm">
            <td colspan="5" class="py-4 text-center text-red-400">
              Error loading activities: {{ error }}
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
                  v-if="activity.user.photo"
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
        >View all activities</NuxtLink
      >
    </div>
  </div>
</template>
