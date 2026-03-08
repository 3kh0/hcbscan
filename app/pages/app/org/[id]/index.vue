<script setup lang="ts">
  import { marked } from "marked";

  const route = useRoute();
  const isIndexed = ref(true);
  const askIndex = ref(false);
  const frozenAt = ref<string | null>(null);
  const isCachedView = ref(false);

  const {
    data: orgData,
    error: orgError,
    status: orgStatus,
  } = useAsyncData(
    `org-${route.params.id}`,
    async () => {
      try {
        return await hcbFetch(`api/v3/organizations/${route.params.id}`);
      } catch {
        const cached = await $fetch(
          `/api/orgs/${route.params.id}/cached`
        );
        if (cached.found) {
          isCachedView.value = true;
          if (cached.org.frozen_at) frozenAt.value = cached.org.frozen_at;
          return {
            id: cached.org.id,
            name: cached.org.name,
            slug: cached.org.slug,
            category: cached.org.category,
            balances: { balance_cents: cached.org.balance_cents },
            financially_frozen: !!cached.org.frozen_at,
          };
        }
        throw new Error("Organization not found");
      }
    },
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

  const dataGridItems = computed(() => {
    if (!orgData.value) return [];
    const items: any[] = [];
    const o = orgData.value;
    if (o.id) items.push({ label: "Internal ID", value: o.id });
    if (o.object) items.push({ label: "Object", value: o.object });
    if (o.href)
      items.push({
        label: "API Link",
        value: o.href,
        link: o.href,
        external: true,
      });
    if (o.slug)
      items.push({
        label: "URL Slug",
        value: o.slug,
        link: buildApiUrl(o.slug),
        external: true,
      });
    if (o.website)
      items.push({
        label: "Website",
        value: o.website,
        link: o.website,
        external: true,
      });
    if (o.category) items.push({ label: "Category", value: o.category });
    if (o.transparent != null)
      items.push({
        label: "Transparency",
        value: o.transparent ? "Yes" : "No",
      });
    if (o.demo_mode != null)
      items.push({ label: "Demo Mode", value: o.demo_mode ? "Yes" : "No" });
    if (o.logo)
      items.push({
        label: "Logo",
        value: o.logo,
        link: o.logo,
        external: true,
      });
    if (o.donation_header)
      items.push({
        label: "Donation Header",
        value: o.donation_header,
        link: o.donation_header,
        external: true,
      });
    if (o.background_image)
      items.push({
        label: "Background Image",
        value: o.background_image,
        link: o.background_image,
        external: true,
      });
    if (o.balances)
      items.push({
        label: "Balances",
        value: `Raw: ${fixMoney(o.balances.balance_cents)} · Fee: ${fixMoney(o.balances.fee_balance_cents)} · Incoming: ${fixMoney(o.balances.incoming_balance_cents)} · Total: ${fixMoney(o.balances.total_raised)}`,
      });
    if (o.created_at)
      items.push({
        label: "Created At",
        value: new Date(o.created_at).toLocaleDateString(),
      });
    if (o.donation_link)
      items.push({
        label: "Donation Link",
        value: o.donation_link,
        link: o.donation_link,
        external: true,
      });
    return items;
  });

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
          v-if="isCachedView"
          class="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6 flex items-center gap-3"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-blue-400 shrink-0"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z"
              clip-rule="evenodd"
            />
          </svg>
          <div>
            <p class="text-sm font-bold text-blue-400">
              This organization appears to be private or no longer accessible.
            </p>
            <p class="text-xs mt-1 text-blue-400/70">
              Showing cached data from our database. Some information may be
              outdated or incomplete.
            </p>
          </div>
        </div>

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

        <UPageHeader
          :title="orgData?.name"
          :image="orgData?.logo"
          :image-alt="orgData?.name + ' logo'"
        >
          <template #actions>
            <UBadge v-if="orgData?.financially_frozen" variant="red" size="md">
              Frozen
            </UBadge>
          </template>
        </UPageHeader>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <UStatCard
            label="Confirmed Balance"
            :value="fixMoney(orgData?.balances?.balance_cents)"
          />
          <UStatCard
            label="Total Received"
            :value="fixMoney(orgData?.balances?.total_raised)"
          />
        </div>

        <UDataGrid :items="dataGridItems" class="mb-6" />

        <UCard v-if="pubMsg" class="mb-6 pub">
          <h2 class="text-xl font-semibold mb-2">Public Message</h2>
          <div v-html="pubMsg"></div>
        </UCard>

        <div v-if="!isCachedView && orgData?.users?.length > 0" class="mb-6">
          <h2 class="text-xl font-semibold mb-2">Users</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <NuxtLink
              v-for="user in orgData?.users"
              :key="user.id"
              :to="`/app/usr/${user.id}`"
            >
              <UCard class="flex items-center text-blue-400 hover:underline">
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
              </UCard>
            </NuxtLink>
          </div>
        </div>
        <UCard v-else-if="!isCachedView" class="mb-6">
          <UEmptyState message="No users found associated with this account" />
        </UCard>

        <div
          v-if="!isCachedView && txnsLoading"
          class="flex flex-col items-center justify-center py-12 bg-surface-1 rounded-lg"
        >
          <Spinner />
          <p class="mt-4 text-white animate-pulse">Loading transactions...</p>
        </div>
        <div v-else-if="!isCachedView" class="mb-6">
          <h2 class="text-xl font-semibold mb-2">Recent Transactions</h2>
          <UCard padding="p-0">
            <TxnList :transactions="transactions" :loading="txnsLoading" />
            <div
              class="flex items-center justify-center gap-4 px-4 py-3 border-t border-border"
            >
              <NuxtLink
                :to="`/app/org/${route.params.id}/txns`"
                class="text-sm text-accent hover:text-accent/80 transition-colors duration-150"
                >View all transactions</NuxtLink
              >
            </div>
          </UCard>
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
