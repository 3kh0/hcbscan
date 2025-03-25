<script setup lang="ts">
import { marked } from "marked";
import { useRoute } from "vue-router";

const route = useRoute();
const orgData = ref<any>(null);
const transactions = ref<any[]>([]);
const loading = ref(true);
const txnsLoading = ref(true);
const error = ref<string | null>(null);

const pubMsg = computed(() => {
  if (!orgData.value?.public_message) return "";
  const pubMsg = orgData.value.public_message
    .replace(/\]\s*\n\s*\(/g, "](")
    .replace(/\[(.*?)\]\s*\((.*?)\)/g, (_, text, url) => {
      if (url.includes(text)) return `[${text}](${url})`;
      return `[${text}](${url})`;
    })
    .replace(/\[(.*?)\]\s*\((.*?)\)/g, (_, text, url) => `[${text}](${url})`);
  return marked.parse(pubMsg);
});

onMounted(async () => {
  try {
    const response = await fetch(
      buildApiUrl(`api/v3/organizations/${route.params.id}`),
      {
        method: "GET",
        headers: { Accept: "application/json" },
      }
    );
    if (!response.ok) throw new Error("org not found");
    orgData.value = await response.json();
    loading.value = false;

    const transactionsResponse = await fetch(
      buildApiUrl(
        `api/v3/organizations/${route.params.id}/transactions?per_page=25`
      ),
      {
        method: "GET",
        headers: { Accept: "application/json" },
      }
    );
    if (!transactionsResponse.ok) throw new Error("transactions not found");
    transactions.value = await transactionsResponse.json();
    txnsLoading.value = false;
  } catch (e) {
    error.value =
      e instanceof Error ? e.message : "failed to load organization";
    console.error(error);
  } finally {
    loading.value = false;
  }
});

useHead({
  title: "Viewing organization - HCBScan",
  meta: [
    {
      name: "description",
      content: "View the details of a specific organization on HCBScan",
    },
  ],
});

watch(orgData, (metadata) => {
  if (metadata) {
    useHead({
      title: `${metadata.name} - HCBScan`,
      meta: [
        {
          name: "description",
          content: `Organization ${metadata.name} with ${fixMoney(
            metadata.balances?.balance_cents
          )} raised`,
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
      <p class="mt-4 text-white animate-pulse">Loading organization...</p>
    </div>
    <div
      v-else-if="error"
      class="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center"
    >
      <p class="text-red-400">
        It seems like we can not load this organization right now. It is either
        private or does not exist.
      </p>
    </div>
    <div v-else>
      <!-- header -->
      <div class="flex items-center justify-center mb-6">
        <a :href="orgData?.logo" target="_blank" rel="noreferrer">
          <img
            v-if="orgData?.logo"
            :src="orgData?.logo"
            alt="Logo"
            class="h-12 w-12 mr-4 object-cover rounded-lg"
          />
        </a>
        <h1 class="font-bold text-4xl">
          {{ orgData?.name }}
        </h1>
      </div>

      <!-- balances -->
      <div class="flex flex-col md:flex-row gap-4 mb-6">
        <div class="bg-zinc-900 p-4 rounded-lg flex-1">
          <h2 class="text-sm text-zinc-400">Confirmed Balance</h2>
          <p class="text-2xl font-bold">
            {{ fixMoney(orgData?.balances?.balance_cents) }}
          </p>
        </div>
        <div class="bg-zinc-900 p-4 rounded-lg flex-1">
          <h2 class="text-sm text-zinc-400">Total Received</h2>
          <p class="text-2xl font-bold">
            {{ fixMoney(orgData?.balances?.total_raised) }}
          </p>
        </div>
      </div>

      <!-- stats -->
      <table class="w-full mb-6 border-collapse bg-zinc-900 text-sm rounded-lg">
        <thead>
          <tr class="text-left">
            <th
              class="py-2 px-4 text-left text-zinc-400 border-b border-zinc-700"
            >
              Key
            </th>
            <th
              class="py-2 px-4 text-left text-zinc-400 border-b border-zinc-700"
            >
              Value
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="orgData?.id">
            <td class="py-2 px-4 font-medium border-b border-zinc-700">
              Internal ID
            </td>
            <td class="py-2 px-4 border-b border-zinc-700">
              {{ orgData?.id }}
            </td>
          </tr>
          <tr v-if="orgData?.object">
            <td class="py-2 px-4 font-medium border-b border-zinc-700">
              Object
            </td>
            <td class="py-2 px-4 border-b border-zinc-700">
              {{ orgData?.object }}
            </td>
          </tr>
          <tr v-if="orgData?.href">
            <td class="py-2 px-4 font-medium border-b border-zinc-700">
              API Link
            </td>
            <td class="py-2 px-4 border-b border-zinc-700">
              <a
                class="underline text-blue-400"
                :href="orgData?.href"
                target="_blank"
              >
                {{ orgData?.href }}
              </a>
            </td>
          </tr>
          <tr v-if="orgData?.name">
            <td class="py-2 px-4 font-medium border-b border-zinc-700">Name</td>
            <td class="py-2 px-4 border-b border-zinc-700">
              {{ orgData?.name }}
            </td>
          </tr>
          <tr v-if="orgData?.slug">
            <td class="py-2 px-4 font-medium border-b border-zinc-700">
              URL Slug
            </td>
            <td class="py-2 px-4 border-b border-zinc-700">
              <a
                class="underline text-blue-400"
                :href="buildApiUrl(`${orgData?.slug}`)"
                target="_blank"
              >
                {{ orgData?.slug }}
              </a>
            </td>
          </tr>
          <tr v-if="orgData?.website">
            <td class="py-2 px-4 font-medium border-b border-zinc-700">
              Website
            </td>
            <td class="py-2 px-4 border-b border-zinc-700">
              <a
                class="underline text-blue-400"
                :href="orgData?.website"
                target="_blank"
              >
                {{ orgData?.website }}
              </a>
            </td>
          </tr>
          <tr v-if="orgData?.category">
            <td class="py-2 px-4 font-medium border-b border-zinc-700">
              Category
            </td>
            <td class="py-2 px-4 border-b border-zinc-700">
              {{ orgData?.category }}
            </td>
          </tr>
          <tr v-if="orgData?.transparent">
            <td class="py-2 px-4 font-medium border-b border-zinc-700">
              Transparency
            </td>
            <td class="py-2 px-4 border-b border-zinc-700">
              {{ orgData?.transparent ? "Yes" : "No" }}
            </td>
          </tr>
          <tr v-if="orgData?.demo_mode">
            <td class="py-2 px-4 font-medium border-b border-zinc-700">
              Demo Mode
            </td>
            <td class="py-2 px-4 border-b border-zinc-700">
              {{ orgData?.demo_mode ? "Yes" : "No" }}
            </td>
          </tr>
          <tr v-if="orgData?.logo">
            <td class="py-2 px-4 font-medium border-b border-zinc-700">Logo</td>
            <td class="py-2 px-4 border-b border-zinc-700">
              <a
                class="underline text-blue-400 break-all"
                :href="orgData?.logo"
                target="_blank"
              >
                {{ orgData?.logo }}
              </a>
            </td>
          </tr>
          <tr v-if="orgData?.donation_header">
            <td class="py-2 px-4 font-medium border-b border-zinc-700">
              Donation Header
            </td>
            <td class="py-2 px-4 border-b border-zinc-700">
              <a
                class="underline text-blue-400 break-all"
                :href="orgData?.donation_header"
                target="_blank"
              >
                {{ orgData?.donation_header }}
              </a>
            </td>
          </tr>
          <tr v-if="orgData?.background_image">
            <td class="py-2 px-4 font-medium border-b border-zinc-700">
              Background Image
            </td>
            <td class="py-2 px-4 border-b border-zinc-700">
              <a
                class="underline text-blue-400 break-all"
                :href="orgData?.background_image"
                target="_blank"
              >
                {{ orgData?.background_image }}
              </a>
            </td>
          </tr>
          <tr v-if="orgData?.balances">
            <td class="py-2 px-4 font-medium border-b border-zinc-700">
              Balances
            </td>
            <td class="py-2 px-4 border-b border-zinc-700">
              Raw Balance: {{ fixMoney(orgData?.balances?.balance_cents) }}.
              Fee: {{ fixMoney(orgData?.balances?.fee_balance_cents) }}.
              Incoming:
              {{ fixMoney(orgData?.balances?.incoming_balance_cents) }}. Total
              Received:
              {{ fixMoney(orgData?.balances?.total_raised) }}
            </td>
          </tr>
          <tr v-if="orgData?.created_at">
            <td class="py-2 px-4 font-medium border-b border-zinc-700">
              Created At
            </td>
            <td class="py-2 px-4 border-b border-zinc-700">
              {{ new Date(orgData?.created_at).toLocaleDateString() }}
            </td>
          </tr>
          <tr v-if="orgData?.donation_link">
            <td class="py-2 px-4 font-medium">Donation Link</td>
            <td class="py-2 px-4">
              <a
                class="underline text-blue-400"
                :href="orgData?.donation_link"
                target="_blank"
              >
                {{ orgData?.donation_link }}
              </a>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- public msg -->
      <div v-if="pubMsg" class="mb-6 bg-zinc-900 p-4 rounded-lg pub">
        <h2 class="text-xl font-semibold mb-2">Public Message</h2>
        <div v-html="pubMsg"></div>
      </div>

      <!-- users -->
      <div v-if="orgData?.users?.length > 0" class="mb-6">
        <h2 class="text-xl font-semibold mb-2">Users</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            v-for="user in orgData?.users"
            :key="user.id"
            class="bg-zinc-900 p-4 rounded-lg flex items-center"
          >
            <img
              :src="`${user.photo}`"
              referrerpolicy="no-referrer"
              loading="lazy"
              :alt="user.full_name"
              class="h-12 w-12 rounded-lg mr-4 object-cover"
            />
            <div>
              <p class="font-md">{{ user.full_name }}</p>
              <p v-if="user.admin" class="text-sm text-red-400">Admin</p>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="bg-zinc-900 p-4 rounded-lg">
        <p class="text-zinc-400">No users found associated with this account</p>
      </div>
      <div
        v-if="txnsLoading"
        class="flex flex-col items-center justify-center py-12 bg-zinc-900 rounded-lg"
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
        <p class="mt-4 text-white animate-pulse">Loading transactions...</p>
      </div>
      <!-- recents -->
      <div v-else class="mb-6">
        <h2 class="text-xl font-semibold mb-2">Recent Transactions</h2>
        <table class="w-full border-collapse bg-zinc-900 text-sm rounded-lg">
          <thead>
            <tr class="text-left">
              <th
                class="py-2 px-4 text-left text-zinc-400 border-b border-zinc-700"
              >
                Date
              </th>
              <th
                class="py-2 px-4 text-left text-zinc-400 border-b border-zinc-700"
              >
                Memo
              </th>
              <th
                class="py-2 px-4 text-left text-zinc-400 border-b border-zinc-700"
              >
                Amount
              </th>
              <th
                class="py-2 px-4 text-left text-zinc-400 border-b border-zinc-700"
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="txn in transactions" :key="txn.id">
              <td class="py-2 px-4 border-b border-zinc-700">
                {{ new Date(txn.date).toLocaleDateString() }}
              </td>
              <td class="py-2 px-4 border-b border-zinc-700">
                <NuxtLink
                  :to="`/app/txn/${txn.id}`"
                  class="text-blue-400 hover:underline"
                >
                  {{ txn.memo }}
                </NuxtLink>
              </td>
              <td class="py-2 px-4 border-b border-zinc-700">
                {{ fixMoney(txn.amount_cents) }}
              </td>
              <td class="py-2 px-4 border-b border-zinc-700">
                <div
                  :class="[
                    'px-3 py-1 rounded-full font-semibold text-center',
                    txn.pending
                      ? 'bg-yellow-500/10 text-yellow-500'
                      : 'bg-green-500/10 text-green-500',
                  ]"
                >
                  {{ txn.pending ? "Pending" : "Completed" }}
                </div>
              </td>
            </tr>
            <tr>
              <td class="py-2 px-4 border-zinc-700 text-center" colspan="4">
                <NuxtLink
                  :to="`/app/org/${route.params.id}/txns`"
                  class="text-blue-400"
                  >View all transactions</NuxtLink
                >
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pub :deep(a) {
  color: rgb(96, 165, 250);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.pub :deep(a:hover) {
  color: rgb(147, 197, 253);
}
</style>
