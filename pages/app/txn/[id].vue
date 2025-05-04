<script setup lang="ts">
  import { buildApiUrl } from "~/utils/apiConfig";

  const route = useRoute();
  const txnData = ref<Transaction | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);

  const getTxn = async () => {
    try {
      loading.value = true;
      const response = await fetch(
        buildApiUrl(`api/v3/transactions/${route.params.id}`),
        { headers: { Accept: "application/json" } }
      );

      if (!response.ok) throw new Error("Transaction not found");

      txnData.value = await response.json();
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : "Failed to load transaction";
      console.error("Error loading transaction:", error.value);
    } finally {
      loading.value = false;
    }
  };

  onMounted(getTxn);

  useHead({
    title: "Viewing transaction - HCBScan",
    meta: [
      {
        name: "description",
        content: "View the details of a specific transaction on HCBScan",
      },
    ],
  });

  watch(txnData, (metadata) => {
    if (metadata) {
      useHead({
        title: `${metadata.id} - HCBScan`,
        meta: [
          {
            name: "description",
            content: `Transaction ${metadata.id} of type ${
              metadata.type
            } for ${fixMoney(metadata.amount_cents)}`,
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
      <p class="mt-4 text-white animate-pulse">Loading transaction...</p>
    </div>

    <div v-else-if="error">
      <ErrorBanner :message="error" />
    </div>

    <div v-else-if="txnData" class="space-y-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-xl font-bold font-mono">{{ txnData.id }}</h1>
          <p class="text-zinc-400">
            {{ txnData.type.replace("_", " ").toUpperCase() }}
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
          <NuxtLink
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
              <td class="py-2 px-4">{{ txnData.type }}</td>
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
