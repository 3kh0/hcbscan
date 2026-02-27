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

  const { data: acts, error } = await useFetch("/api/activities", {
    params: { limit: maxActs },
    transform: (data: Activity[]) => (data ?? []).map(t),
    default: () => [],
  });
</script>

<template>
  <div class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
    <div class="flex justify-between items-center px-5 py-4 border-b border-zinc-800">
      <div>
        <h2 class="text-base font-semibold tracking-tight">Recent Activities</h2>
        <p class="text-xs text-zinc-500 mt-0.5">Latest actions across all of HCB</p>
      </div>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="text-left border-b border-zinc-800">
            <th class="px-5 py-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">ID</th>
            <th class="px-5 py-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">Action</th>
            <th class="px-5 py-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">User</th>
            <th class="px-5 py-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">Organization</th>
            <th class="px-5 py-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">Time</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-800">
          <tr v-if="error" class="text-sm">
            <td colspan="5" class="px-5 py-4 text-center text-red-400">
              Error loading activities: {{ error.message }}
            </td>
          </tr>
          <tr
            v-for="activity in acts"
            v-else
            :key="activity.id"
            class="text-sm hover:bg-zinc-800/50 transition-colors duration-100"
          >
            <td class="px-5 py-3.5">
              <NuxtLink
                :to="`/app/act/${activity.id}`"
                class="text-green-400 hover:text-green-300 font-mono text-xs transition-colors"
                >{{ activity.id }}</NuxtLink
              >
            </td>
            <td class="px-5 py-3.5 text-zinc-300">{{ activity.key }}</td>
            <td class="px-5 py-3.5">
              <div v-if="activity.user" class="flex items-center gap-2">
                <img
                  v-if="activity.user.photo"
                  :src="activity.user.photo"
                  :alt="activity.user.full_name"
                  class="w-6 h-6 rounded-full ring-1 ring-white/10"
                >
                <span class="text-zinc-300">{{ activity.user.full_name }}</span>
              </div>
              <span v-else class="text-zinc-600 text-xs">System</span>
            </td>
            <td class="px-5 py-3.5">
              <NuxtLink
                :to="`/app/org/${activity.organization.id}`"
                class="text-green-400 hover:text-green-300 transition-colors"
              >
                <div class="flex items-center gap-2">
                  <img
                    v-if="activity.organization.logo"
                    :src="activity.organization.logo"
                    :alt="activity.organization.name"
                    class="w-5 h-5 rounded-full ring-1 ring-white/10"
                  >
                  <span>{{ activity.organization.name }}</span>
                </div>
              </NuxtLink>
            </td>
            <td class="px-5 py-3.5 text-zinc-500 text-xs">
              <span :title="date(activity.created_at)">
                {{ relativeTime(activity.created_at) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="px-5 py-3 border-t border-zinc-800">
      <NuxtLink to="/app/acts" class="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1">
        View all activities
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
      </NuxtLink>
    </div>
  </div>
</template>
