<script setup lang="ts">
  const route = useRoute();
  const frozenAt = ref<string | null>(null);

  const {
    data: txnData,
    error: fetchError,
    status,
  } = useAsyncData(
    `txn-${route.params.id}`,
    () => hcbFetch(`api/v3/transactions/${route.params.id}`),
    { server: false }
  );

  const loading = computed(() => status.value === "pending");
  const error = computed(() =>
    fetchError.value ? "Transaction not found" : null
  );

  const { data: orgData } = useLazyAsyncData(
    `txn-org-${route.params.id}`,
    async () => {
      if (!txnData.value?.organization?.id) return null;
      return hcbFetch(`api/v3/organizations/${txnData.value.organization.id}`);
    },
    { server: false, default: () => null }
  );

  const checkOrgFrozen = async (id: string) => {
    try {
      const data = await $fetch(`/api/orgs/${id}/indexed`);
      if (data.frozenAt) {
        frozenAt.value = data.frozenAt;
      }
    } catch {
      // org not indexed, ignore
    }
  };

  if (txnData.value?.organization?.id) {
    checkOrgFrozen(txnData.value.organization.id);
  }

  const isFrozen = computed(
    () => orgData.value?.financially_frozen || frozenAt.value
  );

  const pageTitle = computed(() =>
    txnData.value
      ? `${txnData.value.memo || txnData.value.id} - HCBScan`
      : "Transaction - HCBScan"
  );
  const pageDescription = computed(() =>
    txnData.value
      ? `Transaction ${txnData.value.id} of type ${
          txnData.value.type
        } for ${fixMoney(txnData.value.amount_cents)}`
      : "View transaction details on HCBScan"
  );

  useSeoMeta({
    title: pageTitle,
    ogTitle: pageTitle,
    description: pageDescription,
    ogDescription: pageDescription,
    ogImage: "https://hcbscan.3kh0.net/readme.png",
    twitterImage: "https://hcbscan.3kh0.net/readme.png",
  });

  const txnGridItems = computed(() => {
    if (!txnData.value) return [];
    const t = txnData.value;
    const items: any[] = [{ label: "Memo", value: t.memo }];
    if (orgData.value) {
      items.push({
        label: "Organization",
        value: orgData.value.name + (isFrozen.value ? " (Frozen)" : ""),
        link: `/app/org/${t.organization.id}`,
      });
    }
    items.push({
      label: "Receipts",
      value: `${t.receipts.count}${t.receipts.missing ? " (Receipt Missing)" : ""}`,
    });
    items.push({ label: "Comments", value: String(t.comments.count) });
    if (t.tags?.length) {
      items.push({
        label: "Tags",
        value: t.tags.map((tag: any) => tag.label).join(", "),
      });
    }
    return items;
  });
</script>

<template>
  <div class="mx-auto">
    <div v-if="loading" class="flex flex-col items-center justify-center py-12">
      <Spinner />
      <p class="mt-4 text-white animate-pulse">Loading transaction...</p>
    </div>

    <div v-else-if="error">
      <ErrorBanner :message="error" />
    </div>

    <div v-else-if="txnData" class="space-y-6">
      <div
        v-if="isFrozen"
        class="bg-red-500/10 text-red-400 border-2 border-red-500/50 rounded-lg p-4 flex items-center gap-3"
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
            This transaction belongs to a frozen organization. The parent
            organization has been frozen by HCB, preventing all financial
            activity. This is typically due to an ongoing investigation or legal
            issue.
          </p>
          <p v-if="frozenAt" class="text-xs mt-2 text-red-400">
            HCBScan estimates that this organization has been frozen since
            {{ new Date(frozenAt).toLocaleDateString() }}. Estimates are based
            on the last crawl and may not be exact.
          </p>
        </div>
      </div>

      <UPageHeader
        :title="txnData.id"
        :subtitle="activityLabel(txnData.type)"
        mono
      >
        <template #actions>
          <UBadge :variant="txnData.pending ? 'yellow' : 'green'" size="md">
            {{ txnData.pending ? "Pending" : "Completed" }}
          </UBadge>
        </template>
      </UPageHeader>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <UStatCard label="Amount" :value="fixMoney(txnData.amount_cents)" />
        <UStatCard label="Date" :value="date(txnData.date)">
          <p class="text-sm text-text-muted mt-1">{{ txnData.date }}</p>
        </UStatCard>
        <UCard>
          <p class="text-sm text-text-secondary">Organization</p>
          <div v-if="orgData" class="flex items-center gap-3 mt-2">
            <SafeNuxtImg
              v-if="orgData.logo"
              :src="orgData.logo"
              alt="Logo"
              width="36"
              height="36"
              class="h-9 w-9 rounded-xl object-cover"
            />
            <div>
              <NuxtLink
                :to="`/app/org/${txnData.organization.id}`"
                class="text-blue-400 hover:text-blue-300 text-lg font-semibold transition-colors duration-150"
              >
                {{ orgData.name }}
              </NuxtLink>
              <p class="text-xs text-text-muted">
                {{ fixMoney(orgData.balances?.balance_cents) }} balance
              </p>
            </div>
            <UBadge v-if="isFrozen" variant="red" class="ml-auto"
              >Frozen</UBadge
            >
          </div>
          <NuxtLink
            v-else
            :to="`/app/org/${txnData.organization.id}`"
            class="text-blue-400 hover:text-blue-300 text-2xl font-semibold mt-2 block transition-colors duration-150"
            >View Organization</NuxtLink
          >
        </UCard>
      </div>

      <txnDetail
        v-if="txnData[txnData.type]?.id"
        :id="txnData[txnData.type].id"
        :type="txnData.type"
      />

      <UDataGrid :items="txnGridItems" />
    </div>
  </div>
</template>
