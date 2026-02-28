<script setup lang="ts">
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

  const maxActs = 25;
  const refreshing = ref(false);

  const {
    data: acts,
    error,
    refresh,
  } = await useFetch("/api/activities", {
    params: { limit: maxActs },
    transform: (data: Activity[]) => (data ?? []).map(t),
    default: () => [],
  });

  let interval: ReturnType<typeof setInterval> | undefined;

  onMounted(() => {
    interval = setInterval(async () => {
      if (!refreshing.value) {
        refreshing.value = true;
        try {
          await refresh();
        } finally {
          refreshing.value = false;
        }
      }
    }, 30000);
  });

  onUnmounted(() => {
    if (interval) clearInterval(interval);
  });
</script>

<template>
  <div class="bg-zinc-900 rounded-lg p-6">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">Recent Activities</h2>
      <span v-if="refreshing" class="text-xs text-blue-400 animate-pulse"
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
          <tr v-if="error" class="text-sm">
            <td colspan="5" class="py-4 text-center text-red-400">
              Error loading activities: {{ error.message }}
            </td>
          </tr>
          <tr
            v-for="activity in acts"
            v-else
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
            <td class="py-4">{{ activityLabel(activity.key) }}</td>
            <td class="py-4">
              <NuxtLink
                v-if="activity.user"
                :to="`/app/usr/${activity.user.id}`"
                class="text-blue-400 hover:underline"
              >
                <div class="flex items-center gap-2">
                  <SafeNuxtImg
                    v-if="activity.user.photo"
                    :src="activity.user.photo"
                    :alt="activity.user.full_name"
                    width="24"
                    height="24"
                    class="w-6 h-6 rounded-full"
                  />
                  <span>{{ activity.user.full_name }}</span>
                </div>
              </NuxtLink>
              <span v-else class="text-zinc-500">System</span>
            </td>
            <td class="py-4">
              <NuxtLink
                :to="`/app/org/${activity.organization.id}`"
                class="text-blue-400 hover:underline"
              >
                <div class="flex items-center gap-2">
                  <SafeNuxtImg
                    v-if="activity.organization.logo"
                    :src="activity.organization.logo"
                    :alt="activity.organization.name"
                    width="24"
                    height="24"
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
