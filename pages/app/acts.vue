<script setup lang="ts">
  import { supabase } from "~/utils/supabase/supabase";

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
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data, error: fetchError } = await supabase
        .from("hcb.hackclub.com-acts")
        .select(
          `
        "Activity ID",
        "Key",
        "Created At",
        "User ID",
        "User Name",
        "User Photo",
        "Organization ID",
        "Organization Name",
        "Organization Logo"
      `
        )
        .order("Created At", { ascending: false })
        .range(from, to);

      if (fetchError) throw new Error("Failed to load activities.");

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

    <div v-else class="bg-zinc-900 rounded-lg p-6">
      <h2 class="text-xl font-semibold mb-4">Activities list</h2>
      <p class="text-sm text-zinc-400 mb-4">
        Only showing recent activities from HCB organizations that are in
        Transparency Mode and have opted in to public listing. Due to the amount
        of data, only 50 activities are shown per page and loading can take up
        to 15 seconds.
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
                    />
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <p class="mt-4 text-white animate-pulse">
                    Loading activities...
                  </p>
                </div>
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
              <td class="py-4">{{ activity.key }}</td>
              <td class="py-4">
                <div v-if="activity.user" class="flex items-center gap-2">
                  <img
                    :src="activity.user.photo"
                    :alt="activity.user.full_name"
                    class="w-6 h-6 rounded-full"
                  >
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
                    >
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
    </div>

    <div class="flex items-center justify-between bg-zinc-900 p-4 rounded-lg">
      <button
        :disabled="currentPage <= 1"
        class="px-4 py-2 text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed bg-zinc-800 hover:bg-zinc-700"
        @click="changePage(currentPage - 1)"
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
          class="px-4 py-2 text-sm rounded-lg bg-zinc-800 hover:bg-zinc-700"
          @click="changePage(currentPage + offset)"
        >
          +{{ offset }}
        </button>
      </div>

      <button
        class="px-4 py-2 text-sm rounded-lg bg-zinc-800 hover:bg-zinc-700"
        @click="changePage(currentPage + 1)"
      >
        Next
      </button>
    </div>
  </div>
</template>
