<script setup lang="ts">
import { supabase } from "~/utils/supabase";

const route = useRoute();
const userId = route.params.id;
const udata = ref<any>(null);
const loading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    loading.value = true;
    const { data, error: uerror } = await supabase
      .from("hcb.hackclub.com-users")
      .select("*")
      .eq("id", userId);

    if (uerror) {
      throw new Error("Failed to fetch user data.");
    }

    if (!data || data.length === 0) {
      throw new Error(`User ${userId} not found.`);
    }

    udata.value = data[0];
  } catch (e) {
    error.value = e instanceof Error ? e.message : "An unknown error occurred.";
    console.error("Error loading user:", error.value);
  } finally {
    loading.value = false;
  }
});

useHead({
  title: udata.value?.name
    ? `${udata.value.name} - HCBScan`
    : "User Profile - HCBScan",
  meta: [
    {
      name: "description",
      content: "View user details and associated organizations on HCBScan",
    },
  ],
});

watch(udata, (newudata) => {
  if (newudata) {
    useHead({
      title: `${newudata.name} - HCBScan`,
      meta: [
        {
          name: "description",
          content: `User profile for ${newudata.name} with ${
            newudata.orgs?.length || 0
          } organizations`,
        },
      ],
    });
  }
});
</script>

<template>
  <div class="mx-auto">
    <div v-if="loading" class="flex flex-col items-center justify-center py-12">
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
      <p class="mt-4 text-white animate-pulse">Loading user data...</p>
    </div>

    <div v-else-if="error">
      <ErrorBanner :message="error" />
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
          <h3 class="text-zinc-400">User ID</h3>
          <p class="font-mono">{{ udata.id }}</p>
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

      <div
        class="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6"
      >
        <h3 class="font-bold text-yellow-400 mb-2">Debug Information</h3>
        <pre
          class="text-xs text-zinc-400 overflow-auto p-2 bg-zinc-900 rounded"
          >{{ JSON.stringify(udata, null, 2) }}</pre
        >
      </div>
    </div>
  </div>
</template>
