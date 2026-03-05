<script setup lang="ts">
  import { marked } from "marked";

  const route = useRoute();
  const isIndexed = ref(true);
  const askIndex = ref(false);
  const frozenAt = ref<string | null>(null);

  const {
    data: orgData,
    error: orgError,
    status: orgStatus,
  } = useAsyncData(
    `org-${route.params.id}`,
    () => hcbFetch(`api/v3/organizations/${route.params.id}`),
    { server: false }
  );

  const loading = computed(() => orgStatus.value === "pending");
  const error = computed(() =>
    orgError.value ? "This organization does not exist." : null
  );

  const { data: transactions, status: txnsStatus } = useLazyAsyncData(
    `org-txns-${route.params.id}`,
    async () => {
      if (!orgData.value?.id) return [];
      return hcbFetch(
        `api/v3/organizations/${orgData.value.id}/transactions?per_page=25`
      );
    },
    { server: false, default: () => [], watch: [orgData] }
  );

  const txnsLoading = computed(() => txnsStatus.value === "pending");

  const pubMsg = computed(() => {
    if (!orgData.value?.public_message) return "";
    const msg = orgData.value.public_message
      .replace(/\]\s*\n\s*\(/g, "](")
      .replace(
        /\[(.*?)\]\s*\((.*?)\)/g,
        (_: string, t: string, u: string) => `[${t}](${u})`
      );
    return marked.parse(msg);
  });

  const checkIndex = async (id: string) => {
    try {
      const data = await $fetch(`/api/orgs/${id}/indexed`);
      if (!data.indexed) {
        isIndexed.value = false;
        askIndex.value = true;
      }
      if (data.frozenAt) {
        frozenAt.value = data.frozenAt;
      }
    } catch {
      isIndexed.value = false;
      askIndex.value = true;
    }
  };

  const indexRequest = async () => {
    try {
      await $fetch("/api/index-org", {
        method: "POST",
        body: { id: orgData.value.id },
      });
      alert("Sent index request successfully.");
      isIndexed.value = true;
      askIndex.value = false;
    } catch (e) {
      console.error(e);
      alert("Failed to send index request.");
    }
  };

  watch(
    orgData,
    (val) => {
      if (val?.id) checkIndex(val.id);
    },
    { immediate: true }
  );

  const img = useImage();
  const defaultOgImage = "https://hcbscan.3kh0.net/readme.png";

  const pageTitle = computed(() =>
    orgData.value?.name
      ? `${orgData.value.name} - HCBScan`
      : "Organization - HCBScan"
  );
  const pageDescription = computed(() =>
    orgData.value?.name
      ? `Organization ${orgData.value.name} with ${fixMoney(
          orgData.value.balances?.balance_cents
        )} raised on HCBScan`
      : "View organization details on HCBScan"
  );
  const ogImg = computed(() =>
    orgData.value?.logo
      ? `https://hcbscan.3kh0.net${img(orgData.value.logo, { width: 512, height: 512 })}`
      : defaultOgImage
  );

  useSeoMeta({
    title: pageTitle,
    ogTitle: pageTitle,
    description: pageDescription,
    ogDescription: pageDescription,
    ogImage: ogImg,
    twitterImage: ogImg,
  });
</script>

<template>
  <div>
    <div
      v-if="askIndex"
      class="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4 flex items-center justify-between"
    >
      <div class="flex items-center">
        <p class="text-md text-yellow-400">
          This organization is not in our database. Would you like to index it?
        </p>
      </div>
      <button
        class="text-md px-2 py-1 bg-yellow-600/10 border border-yellow-500/20 rounded-lg text-yellow-500 hover:bg-yellow-500/20 active:scale-[0.97] transition-all duration-200"
        @click="indexRequest"
      >
        Index Organization
      </button>
    </div>

    <div class="mx-auto">
      <div
        v-if="loading"
        class="flex flex-col items-center justify-center py-12"
      >
        <Spinner />
        <p class="mt-4 text-white animate-pulse">Loading organization...</p>
      </div>

      <div v-else-if="error">
        <ErrorBanner :message="error" />
      </div>

      <div v-else>
        <div
          v-if="orgData?.financially_frozen"
          class="bg-red-500/10 text-red-400 border-2 border-red-500/50 rounded-lg p-4 mb-6 flex items-center gap-3"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-red-400 shrink-0"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.499-2.599 4.499H4.645c-2.309 0-3.752-2.5-2.598-4.499L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
              clip-rule="evenodd"
            />
          </svg>
          <div>
            <p class="text-sm font-bold">
              This organization has been frozen by HCB, preventing all financial
              activity. This is typically due to a ongoing investigation or
              legal issue. Please exercise caution when interacting with it.
            </p>
            <p class="text-xs mt-2 text-red-400">
              HCBScan estimates that this organization has been frozen since
              {{ new Date(frozenAt).toLocaleDateString() }}. Estimates are based
              on the last crawl from the organization and may not be exact.
            </p>
          </div>
        </div>

        <div class="flex items-center justify-center mb-6">
          <a :href="orgData?.logo" target="_blank" rel="noreferrer">
            <SafeNuxtImg
              v-if="orgData?.logo"
              :src="orgData?.logo"
              alt="Logo"
              width="48"
              height="48"
              class="h-12 w-12 mr-4 object-cover rounded-lg"
            />
          </a>
          <h1 class="font-bold text-4xl">
            {{ orgData?.name }}
          </h1>
        </div>

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

        <table
          class="w-full mb-6 border-collapse bg-zinc-900 text-sm rounded-lg"
        >
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
              <td class="py-2 px-4 font-medium border-b border-zinc-700">
                Name
              </td>
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
              <td class="py-2 px-4 font-medium border-b border-zinc-700">
                Logo
              </td>
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

        <div v-if="pubMsg" class="mb-6 bg-zinc-900 p-4 rounded-lg pub">
          <h2 class="text-xl font-semibold mb-2">Public Message</h2>
          <div v-html="pubMsg"></div>
        </div>

        <div v-if="orgData?.users?.length > 0" class="mb-6">
          <h2 class="text-xl font-semibold mb-2">Users</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <NuxtLink
              v-for="user in orgData?.users"
              :key="user.id"
              :to="`/app/usr/${user.id}`"
              class="bg-zinc-900 p-4 rounded-lg flex items-center text-blue-400 hover:underline"
            >
              <SafeNuxtImg
                :src="user.photo"
                loading="lazy"
                :alt="user.full_name"
                width="48"
                height="48"
                class="h-12 w-12 rounded-lg mr-4 object-cover"
              />
              <div>
                <p class="font-md">{{ user.full_name }}</p>
                <p v-if="user.admin" class="text-sm text-red-400">⚡ Admin</p>
              </div>
            </NuxtLink>
          </div>
        </div>
        <div v-else class="bg-zinc-900 p-4 rounded-lg">
          <p class="text-zinc-400">
            No users found associated with this account
          </p>
        </div>

        <div
          v-if="txnsLoading"
          class="flex flex-col items-center justify-center py-12 bg-zinc-900 rounded-lg"
        >
          <Spinner />
          <p class="mt-4 text-white animate-pulse">Loading transactions...</p>
        </div>
        <div v-else class="mb-6">
          <h2 class="text-xl font-semibold mb-2">Recent Transactions</h2>
          <div class="bg-zinc-900 rounded-lg overflow-hidden">
            <TxnList
              :transactions="transactions"
              :loading="txnsLoading"
            />
            <div
              class="flex items-center justify-center gap-4 px-4 py-3 border-t border-zinc-800/50"
            >
              <NuxtLink
                :to="`/app/org/${route.params.id}/txns`"
                class="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-150"
                >View all transactions</NuxtLink
              >
            </div>
          </div>
        </div>
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
