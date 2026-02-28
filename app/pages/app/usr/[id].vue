<script setup lang="ts">
  interface UserActivity {
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

  const route = useRoute();
  const userId = route.params.id;

  const { data: udata, error } = await useFetch(`/api/users/${userId}`);

  const actsPage = ref(1);

  const { data: userActs, status: actsStatus } = await useFetch(
    `/api/users/${userId}/activities`,
    {
      params: { page: actsPage, limit: 25 },
      watch: [actsPage],
      default: () => [] as UserActivity[],
    }
  );

  const hasMoreActs = computed(
    () => (userActs.value as UserActivity[])?.length === 25
  );

  const changeActsPage = (page: number) => {
    actsPage.value = page;
  };

  const pageTitle = computed(() =>
    udata.value?.name
      ? `${udata.value.name} - HCBScan`
      : "User Profile - HCBScan"
  );
  const pageDescription = computed(() =>
    udata.value?.name
      ? `User profile for ${udata.value.name} with ${
          udata.value.orgs?.length || 0
        } organizations on HCBScan`
      : "View user details and associated organizations on HCBScan"
  );

  useSeoMeta({
    title: pageTitle,
    ogTitle: pageTitle,
    description: pageDescription,
    ogDescription: pageDescription,
    ogImage: "https://hcbscan.3kh0.net/readme.png",
    twitterImage: "https://hcbscan.3kh0.net/readme.png",
  });
</script>

<template>
  <div class="mx-auto">
    <div v-if="error">
      <ErrorBanner
        :message="
          error.statusCode === 404 ? `User ${userId} not found.` : error.message
        "
      />
    </div>

    <div v-else-if="udata" class="space-y-6">
      <div class="flex items-center mb-6">
        <img
          v-if="udata.avatar"
          :src="udata.avatar"
          alt="User Avatar"
          class="h-16 w-16 rounded-lg mr-4 object-cover"
        />
        <div
          v-else
          class="h-16 w-16 bg-zinc-700 rounded-lg mr-4 flex items-center justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-8 w-8 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <h1 class="font-bold text-4xl">{{ udata.name }}</h1>
      </div>
      <div class="rounded-lg mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-zinc-900 p-4 rounded-lg">
          <h3 class="text-zinc-400">Net Worth</h3>
          <p class="font-bold text-2xl">
            {{ fixMoney(udata.netWorth) }}
          </p>
        </div>
        <div class="bg-zinc-900 p-4 rounded-lg">
          <h3 class="text-zinc-400">Name</h3>
          <p class="font-bold">{{ udata.name }}</p>
        </div>
        <div class="bg-zinc-900 p-4 rounded-lg">
          <h3 class="text-zinc-400">Organizations</h3>
          <p class="font-bold">{{ udata.orgs?.length || 0 }}</p>
        </div>
      </div>
      <div v-if="udata.orgs && udata.orgs.length > 0" class="space-y-4">
        <h2 class="text-xl font-semibold">Organizations</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="org in udata.orgs"
            :key="org.id"
            class="bg-zinc-900 p-4 rounded-lg hover:bg-zinc-800 transition-colors duration-200"
          >
            <NuxtLink :to="`/app/org/${org.id}`" class="flex items-center">
              <div class="mr-3">
                <img
                  v-if="org.logo"
                  :src="org.logo"
                  :alt="org.name"
                  class="h-10 w-10 rounded-lg object-cover"
                />
                <div
                  v-else
                  class="h-10 w-10 bg-zinc-700 rounded-lg flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6 text-zinc-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <h3 class="font-medium text-blue-400 hover:underline">
                  {{ org.name }}
                </h3>
                <p class="text-xs text-zinc-400">ID: {{ org.id }}</p>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>

      <div v-else class="bg-zinc-900 rounded-lg p-4 text-center">
        <p class="text-zinc-400">
          I couldn't find any organizations for this user.
        </p>
      </div>

      <!-- User Activities -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold">Recent Activities</h2>
        <div class="bg-zinc-900 rounded-lg p-6">
          <div v-if="actsStatus === 'pending'" class="flex justify-center py-8">
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
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <div
            v-else-if="(userActs as UserActivity[]).length === 0"
            class="text-center py-4"
          >
            <p class="text-zinc-400">No activities found for this user.</p>
          </div>
          <div v-else class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="text-left text-zinc-400 text-sm">
                  <th class="pb-4">ID</th>
                  <th class="pb-4">Action</th>
                  <th class="pb-4">Organization</th>
                  <th class="pb-4">Time</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-700">
                <tr
                  v-for="act in userActs as UserActivity[]"
                  :key="act['Activity ID']"
                  class="text-sm"
                >
                  <td class="py-4">
                    <NuxtLink
                      :to="`/app/act/${act['Activity ID']}`"
                      class="text-blue-400 hover:underline font-mono"
                    >
                      {{ act["Activity ID"] }}
                    </NuxtLink>
                  </td>
                  <td class="py-4">{{ act["Key"] }}</td>
                  <td class="py-4">
                    <NuxtLink
                      v-if="act['Organization ID']"
                      :to="`/app/org/${act['Organization ID']}`"
                      class="text-blue-400 hover:underline"
                    >
                      <div class="flex items-center gap-2">
                        <img
                          v-if="act['Organization Logo']"
                          :src="act['Organization Logo']"
                          :alt="act['Organization Name']"
                          class="w-6 h-6 rounded-full"
                        />
                        <span>{{ act["Organization Name"] }}</span>
                      </div>
                    </NuxtLink>
                    <span v-else class="text-zinc-500">—</span>
                  </td>
                  <td class="py-4 text-zinc-400">
                    <span :title="date(act['Created At'])">
                      {{ relativeTime(act["Created At"]) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div
            v-if="(userActs as UserActivity[]).length > 0"
            class="flex items-center justify-between mt-4 pt-4 border-t border-zinc-700"
          >
            <button
              :disabled="actsPage <= 1"
              class="px-4 py-2 text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed bg-zinc-800 hover:bg-zinc-700"
              @click="changeActsPage(actsPage - 1)"
            >
              Previous
            </button>
            <span class="text-sm text-zinc-400">Page {{ actsPage }}</span>
            <button
              :disabled="!hasMoreActs"
              class="px-4 py-2 text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed bg-zinc-800 hover:bg-zinc-700"
              @click="changeActsPage(actsPage + 1)"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
