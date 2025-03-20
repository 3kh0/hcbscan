<script setup lang="ts">
import { buildApiUrl } from "~/utils/apiConfig";

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
    const response = await fetch(
      buildApiUrl(`api/v3/activities?page=${page}&per_page=${itemsPerPage}`),
      {
        method: "GET",
        headers: { Accept: "application/json" },
      }
    );
    if (!response.ok) throw new Error("ah fuck it broke");
    const data = await response.json();
    acts.value = data;
  } catch (e) {
    error.value = e instanceof Error ? e.message : "something something";
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const changePage = async (page: number) => {
  await router.push({ query: { page: page.toString() } });
  await gimmeData(page);
  currentPage.value = page;
  window.scrollTo(0, 0);
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
  title: "Viewing recent activites - HCBScan",
  meta: [
    {
      name: "description",
      content: "View all the recent activies and browse them using HCBScan",
    },
  ],
});
</script>

<template>
  <div class="space-y-4">
    <!-- list -->
    <div class="bg-zinc-900 rounded-lg p-6">
      <h2 class="text-xl font-semibold mb-4">Activities list</h2>
      <p class="text-sm text-zinc-400 mb-4">
        Only showing recent activities from HCB organizations that are in
        Transparency Mode and have opted in to public listing. Due to the amount
        of data, only 50 activities are shown per page and loading can take up
        to 15 seconds.
      </p>
      <div class="overflow-x-auto">
        <table class="w-full" v-if="!error">
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
        <div
          v-else
          class="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center"
        >
          <p class="text-red-400">
            Whoops, something broke! This is most likely because the HCB server
            is overloaded or was too slow to respond. Try reloading the page or
            waiting a bit. Error: {{ error }}
          </p>
        </div>
      </div>
    </div>

    <!-- Bottom Pagination -->
    <div class="flex items-center justify-between bg-zinc-900 p-4 rounded-lg">
      <button
        @click="changePage(currentPage - 1)"
        :disabled="currentPage <= 1"
        class="px-4 py-2 text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed bg-zinc-800 hover:bg-zinc-700"
      >
        Previous
      </button>

      <div class="flex items-center gap-2">
        <span class="px-4 py-2 bg-zinc-800 rounded-lg"
          >Page {{ currentPage }}</span
        >
        <button
          v-for="offset in 3"
          :key="offset"
          @click="changePage(currentPage + offset)"
          class="px-4 py-2 text-sm rounded-lg bg-zinc-800 hover:bg-zinc-700"
        >
          +{{ offset }}
        </button>
      </div>

      <button
        @click="changePage(currentPage + 1)"
        class="px-4 py-2 text-sm rounded-lg bg-zinc-800 hover:bg-zinc-700"
      >
        Next
      </button>
    </div>
  </div>
</template>
