<script setup lang="ts">
  const route = useRoute();
  const frozenAt = ref<string | null>(null);

  const {
    data: txnData,
    error: fetchError,
    status,
  } = await useAsyncData(`txn-${route.params.id}`, async () => {
    const response = await $fetch<Transaction>(
      buildApiUrl(`api/v3/transactions/${route.params.id}`),
      { headers: { Accept: "application/json" } }
    );
    return response;
  });

  const loading = computed(() => status.value === "pending");
  const error = computed(() =>
    fetchError.value ? "Transaction not found" : null
  );

  const { data: orgData } = await useLazyAsyncData(
    `txn-org-${route.params.id}`,
    async () => {
      if (!txnData.value?.organization?.id) return null;
      const response = await $fetch<any>(
        buildApiUrl(`api/v3/organizations/${txnData.value.organization.id}`),
        { headers: { Accept: "application/json" } }
      );
      return response;
    },
    { default: () => null }
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

      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-xl font-bold font-mono">{{ txnData.id }}</h1>
          <p class="text-zinc-400">
            {{ activityLabel(txnData.type) }}
          </p>
        </div>
        <div
          :class="[
            'px-3 py-1 rounded-full text-lg font-semibold',
            txnData.pending
              ? 'bg-yellow-500/10 text-yellow-500'
              : 'bg-green-500/10 text-green-500',
          ]"
        >
          {{ txnData.pending ? "Pending" : "Completed" }}
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-0">
        <div class="bg-zinc-900 rounded-lg p-4">
          <p class="text-sm text-zinc-400">Amount</p>
          <p class="text-2xl font-bold">{{ fixMoney(txnData.amount_cents) }}</p>
        </div>

        <div class="bg-zinc-900 rounded-lg p-4">
          <p class="text-sm text-zinc-400">Date</p>
          <p class="text-2xl font-bold">
            {{ date(txnData.date) }}
            <span class="text-zinc-400 text-lg font-normal">{{
              txnData.date
            }}</span>
          </p>
        </div>

        <div class="bg-zinc-900 rounded-lg p-4">
          <p class="text-sm text-zinc-400">Organization</p>
          <div v-if="orgData" class="flex items-center gap-3 mt-1">
            <SafeNuxtImg
              v-if="orgData.logo"
              :src="orgData.logo"
              alt="Logo"
              width="36"
              height="36"
              class="h-9 w-9 rounded-lg object-cover"
            />
            <div>
              <NuxtLink
                :to="`/app/org/${txnData.organization.id}`"
                class="text-blue-400 hover:underline text-lg font-semibold"
              >
                {{ orgData.name }}
              </NuxtLink>
              <p class="text-xs text-zinc-400">
                {{ fixMoney(orgData.balances?.balance_cents) }} balance
              </p>
            </div>
            <span
              v-if="isFrozen"
              class="ml-auto px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30"
            >
              Frozen
            </span>
          </div>
          <NuxtLink
            v-else
            :to="`/app/org/${txnData.organization.id}`"
            class="text-blue-400 hover:underline text-2xl font-semibold"
            >View Organization</NuxtLink
          >
        </div>
      </div>

      <div v-if="txnData" class="bg-zinc-900 rounded-lg my-4">
        <table class="w-full">
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
          <tbody class="divide-y divide-zinc-700">
            <tr>
              <td class="py-2 px-4 text-zinc-400">ID</td>
              <td class="py-2 px-4">{{ txnData.id }}</td>
            </tr>
            <tr>
              <td class="py-2 px-4 text-zinc-400">Object</td>
              <td class="py-2 px-4">{{ txnData.object }}</td>
            </tr>
            <tr>
              <td class="py-2 px-4 text-zinc-400">Memo</td>
              <td class="py-2 px-4">{{ txnData.memo }}</td>
            </tr>
            <tr>
              <td class="py-2 px-4 text-zinc-400">Date</td>
              <td class="py-2 px-4">{{ txnData.date }}</td>
            </tr>
            <tr>
              <td class="py-2 px-4 text-zinc-400">Type</td>
              <td class="py-2 px-4">{{ activityLabel(txnData.type) }}</td>
            </tr>
            <tr v-if="orgData">
              <td class="py-2 px-4 text-zinc-400">Organization</td>
              <td class="py-2 px-4">
                <NuxtLink
                  :to="`/app/org/${txnData.organization.id}`"
                  class="text-blue-400 hover:underline"
                >
                  {{ orgData.name }}
                </NuxtLink>
                <span v-if="isFrozen" class="ml-2 text-red-400"> Frozen </span>
              </td>
            </tr>
            <tr>
              <td class="py-2 px-4 text-zinc-400">Receipts</td>
              <td class="py-2 px-4">
                {{ txnData.receipts.count }}
                <span
                  v-if="txnData.receipts.missing"
                  class="text-yellow-500 ml-2"
                  >(Receipt Missing)</span
                >
              </td>
            </tr>
            <tr>
              <td class="py-2 px-4 text-zinc-400">Comments</td>
              <td class="py-2 px-4">{{ txnData.comments.count }}</td>
            </tr>
            <tr v-if="txnData.tags.length">
              <td class="py-2 px-4 text-zinc-400">Tags</td>
              <td class="py-2 px-4">
                <span
                  v-for="tag in txnData.tags"
                  :key="tag.id"
                  class="inline-block bg-zinc-700 px-2 py-1 rounded mr-2 text-sm"
                  >{{ tag.label }}</span
                >
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <txnDetail :id="txnData[txnData.type]?.id" :type="txnData.type" />
    </div>
  </div>
</template>
