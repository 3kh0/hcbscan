<script setup lang="ts">
interface User {
  id: string;
  full_name: string;
  admin: boolean;
  photo: string;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  website: string | null;
}

interface Activity {
  id: string;
  object: string;
  key: string;
  created_at: string;
  organization: Organization;
  user: User | null;
}

const route = useRoute();
const activityData = ref<Activity | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const formatActivityKey = (key: string) => {
  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

onMounted(async () => {
  try {
    const response = await fetch(
      `https://hcb.hackclub.com/api/v3/activities/${route.params.id}`,
      { headers: { Accept: "application/json" } }
    );
    if (!response.ok) throw new Error("Activity not found");
    activityData.value = await response.json();
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Failed to load activity";
  } finally {
    loading.value = false;
  }
});

useHead({
  title: "Viewing activity - HCBScan",
  meta: [
    {
      name: "description",
      content: "View the details of a specific activity on HCBScan",
    },
  ],
});

watch(activityData, (metadata) => {
  if (metadata) {
    useHead({
      title: `${formatActivityKey(metadata.key)} - HCBScan`,
      meta: [
        {
          name: "description",
          content: `Activity ${metadata.id} performed by ${
            metadata.user?.full_name || "unknown"
          } for ${metadata.organization.name}`,
        },
      ],
    });
  }
});
</script>

<template>
  <div class="mx-auto">
    <!-- load -->
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
      <p class="mt-4 text-white animate-pulse">Loading activity...</p>
    </div>

    <!-- error -->
    <div
      v-else-if="error"
      class="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center"
    >
      <p class="text-red-400">{{ error }}</p>
    </div>

    <!-- act -->
    <div v-else-if="activityData" class="space-y-6">
      <!-- head -->
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-xl font-bold font-mono">{{ activityData.id }}</h1>
          <p class="text-zinc-400">{{ formatActivityKey(activityData.key) }}</p>
        </div>
        <p class="text-zinc-400">{{ date(activityData.created_at) }}</p>
      </div>

      <!-- org -->
      <div class="bg-zinc-900 rounded-lg p-4 mb-4">
        <h2 class="text-sm text-zinc-400 mb-3">Organization</h2>
        <div class="flex items-center gap-4">
          <img
            v-if="activityData.organization.logo"
            :src="activityData.organization.logo"
            :alt="activityData.organization.name"
            class="w-12 h-12 rounded-lg object-cover"
          />
          <div>
            <h2 class="font-semibold text-lg">
              {{ activityData.organization.name }}
            </h2>
            <NuxtLink
              :to="`/app/org/${activityData.organization.id}`"
              class="text-blue-400 hover:underline text-sm font-semibold"
            >
              View Organization
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- user -->
      <div v-if="activityData.user" class="bg-zinc-900 rounded-lg p-4 mb-4">
        <h2 class="text-sm text-zinc-400 mb-3">Performed By</h2>
        <div class="flex items-center gap-3">
          <img
            :src="activityData.user.photo"
            :alt="activityData.user.full_name"
            class="w-10 h-10 rounded-full"
          />
          <div>
            <p class="font-medium">{{ activityData.user.full_name }}</p>
            <p v-if="activityData.user.admin" class="text-xs text-red-400">
              Admin
            </p>
          </div>
        </div>
      </div>

      <!-- data -->
      <div class="bg-zinc-900 rounded-lg mb-4">
        <table class="w-full">
          <tbody class="divide-y divide-zinc-800">
            <tr>
              <td class="py-2 px-4 text-zinc-400">ID</td>
              <td class="py-2 px-4 font-mono">{{ activityData.id }}</td>
            </tr>
            <tr>
              <td class="py-2 px-4 text-zinc-400">Object</td>
              <td class="py-2 px-4">{{ activityData.object }}</td>
            </tr>
            <tr>
              <td class="py-2 px-4 text-zinc-400">Action</td>
              <td class="py-2 px-4">
                {{ activityData.key }}
              </td>
            </tr>
            <tr>
              <td class="py-2 px-4 text-zinc-400">Action</td>
              <td class="py-2 px-4">
                {{ activityData.created_at }}
                <span class="text-zinc-400">{{
                  date(activityData.created_at)
                }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- txn -->
      <div class="bg-zinc-900 rounded-lg p-4" v-if="activityData.transaction">
        <h2 class="text-sm text-zinc-400 mb-3">Related Transaction</h2>
        <div class="grid grid-cols-2 gap-4">
          <div class="p-3 bg-zinc-800/50 rounded-lg">
            <div class="text-zinc-400 text-sm mb-1">ID</div>
            <div class="font-mono">{{ activityData.transaction.id }}</div>
          </div>
          <div class="p-3 bg-zinc-800/50 rounded-lg">
            <div class="text-zinc-400 text-sm mb-1">Amount</div>
            <div>{{ fixMoney(activityData.transaction.amount_cents) }}</div>
          </div>
          <div
            class="p-3 bg-zinc-800/50 rounded-lg"
            v-if="activityData.transaction.memo"
          >
            <div class="text-zinc-400 text-sm mb-1">Memo</div>
            <div>{{ activityData.transaction.memo }}</div>
          </div>
          <div class="p-3 bg-zinc-800/50 rounded-lg">
            <div class="text-zinc-400 text-sm mb-1">Status</div>
            <div>
              <span
                class="px-3 py-1 rounded-full text-sm"
                :class="
                  activityData.transaction.pending
                    ? 'bg-yellow-400/10 text-yellow-400'
                    : 'bg-green-400/10 text-green-400'
                "
              >
                {{ activityData.transaction.pending ? "Pending" : "Completed" }}
              </span>
            </div>
          </div>
        </div>
        <div class="mt-2">
          <NuxtLink
            :to="`/app/txn/${activityData.transaction.id}`"
            class="text-blue-400 hover:underline text-sm font-semibold"
          >
            View Full Transaction
          </NuxtLink>
        </div>
      </div>
      <div class="bg-zinc-900 rounded-lg p-4" v-else>
        <p class="text-zinc-400">No related transaction found</p>
      </div>
    </div>
  </div>
</template>
