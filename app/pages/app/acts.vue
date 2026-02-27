<script setup lang="ts">
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
      id: string;
    };
  }

  const route = useRoute();
  const router = useRouter();

  const currentPage = ref(Number(route.query.page) || 1);
  const itemsPerPage = 50; // setting this higher can break stuff due to how long it takes to load
  const acts = ref<Activity[]>([]);
  const loading = ref(true);
  const error = ref<string | null>(null);

  const gimmeData = async (page: number) => {
    loading.value = true;
    try {
      const data = await $fetch("/api/activities", {
        params: { page, limit: itemsPerPage },
      });

      acts.value = data.map((act) => ({
        id: act["Activity ID"],
        key: act["Key"],
        created_at: act["Created At"],
        user: act["User ID"]
          ? {
              full_name: act["User Name"],
              photo: act["User Photo"],
            }
          : null,
        organization: {
          name: act["Organization Name"],
          logo: act["Organization Logo"],
          id: act["Organization ID"],
        },
      }));
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : "An unknown error occurred.";
      console.error("Error loading activities:", error.value);
    } finally {
      loading.value = false;
    }
  };

  const changePage = async (page: number) => {
    try {
      await router.push({ query: { page: page.toString() } });
      await gimmeData(page);
      currentPage.value = page;
      window.scrollTo(0, 0);
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Failed to change page.";
      console.error("Error changing page:", error.value);
    }
  };

  watch(
    () => route.query.page,
    (newPage) => {
      const page = Number(newPage) || 1;
      if (page !== currentPage.value) {
        gimmeData(page);
        currentPage.value = page;
      }
    }
  );

  onMounted(() => {
    gimmeData(currentPage.value);
  });

  useHead({
    title: "Viewing recent activities - HCBScan",
    meta: [
      {
        name: "description",
        content: "View all the recent activities and browse them using HCBScan",
      },
    ],
  });
</script>

<template>
  <div class="space-y-4">
    <div v-if="error" class="mb-4">
      <ErrorBanner :message="error" />
    </div>

    <div v-else class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div class="px-5 py-4 border-b border-zinc-800">
        <h2 class="text-base font-semibold tracking-tight">Activities</h2>
        <p class="text-xs text-zinc-500 mt-0.5">
          Showing organizations in Transparency Mode. Up to 50 per page.
        </p>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-zinc-800">
              <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-zinc-500">ID</th>
              <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-zinc-500">Action</th>
              <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-zinc-500">User</th>
              <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-zinc-500">Organization</th>
              <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-zinc-500">Time</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-800">
            <tr v-if="loading" class="text-sm">
              <td colspan="5" class="px-5 py-4 text-center">
                <div class="flex flex-col items-center justify-center py-10">
                  <svg
                    class="animate-spin h-6 w-6 text-green-400"
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
                  <p class="mt-3 text-sm text-zinc-400">Loading activities...</p>
                </div>
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
                    :src="activity.user.photo"
                    :alt="activity.user.full_name"
                    class="w-5 h-5 rounded-full ring-1 ring-white/10"
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
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between bg-zinc-900 border border-zinc-800 px-5 py-3 rounded-xl">
      <button
        :disabled="currentPage <= 1"
        class="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg disabled:opacity-30 disabled:cursor-not-allowed text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all duration-150"
        @click="changePage(currentPage - 1)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
        Previous
      </button>

      <span class="text-sm text-zinc-500 font-mono">
        Page <span class="text-white font-medium">{{ currentPage }}</span>
      </span>

      <button
        class="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all duration-150"
        @click="changePage(currentPage + 1)"
      >
        Next
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </div>
</template>
