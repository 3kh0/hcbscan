<script setup lang="ts">
interface User {
  id: string;
  object: string;
  full_name: string;
  admin: boolean;
  photo: string;
}

interface Card {
  id: string;
  object: string;
  href: string;
}

interface CardCharge {
  id: string;
  object: string;
  href: string;
  memo: string;
  amount_cents: number;
  date: string;
  card: Card;
  user: User;
}

interface Transaction {
  id: string;
  object: string;
  href: string;
  amount_cents: number;
  memo: string;
  date: string;
  type:
    | "invoice"
    | "donation"
    | "ach_transfer"
    | "check"
    | "transfer"
    | "bank_account_transaction"
    | "card_charge";
  pending: boolean;
  receipts: { count: number; missing: boolean };
  comments: { count: number };
  organization: {
    id: string;
    name: string;
  };
  tags: Array<{ id: string; label: string }>;
  card_charge?: CardCharge;
}

const route = useRoute();
const txnData = ref<Transaction | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const cardChargeData = ref<CardCharge | null>(null);
const cardChargeLoading = ref(false);
const cardChargeError = ref<string | null>(null);

onMounted(async () => {
  try {
    const response = await fetch(
      `https://hcb.hackclub.com/api/v3/transactions/${route.params.id}`,
      { headers: { Accept: "application/json" } }
    );
    if (!response.ok) throw new Error("Transaction not found");
    txnData.value = await response.json();
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Failed to load transaction";
    console.error("Something went wrong", error);
  } finally {
    loading.value = false;
  }
});

const isCardCharge = computed(() => {
  return txnData.value?.type === "card_charge";
});

const fetchCardCharge = async (chargeId: string) => {
  cardChargeLoading.value = true;
  try {
    const response = await fetch(
      `https://hcb.hackclub.com/api/v3/card_charges/${chargeId}`,
      { headers: { Accept: "application/json" } }
    );
    if (!response.ok) throw new Error("Card charge not found");
    cardChargeData.value = await response.json();
  } catch (e) {
    cardChargeError.value =
      e instanceof Error ? e.message : "Failed to load card charge";
    console.error("Error fetching card charge:", e);
  } finally {
    cardChargeLoading.value = false;
  }
};

watch(
  () => txnData.value?.card_charge?.id,
  (newChargeId) => {
    if (newChargeId && isCardCharge.value) {
      fetchCardCharge(newChargeId);
    }
  }
);

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
      <p class="mt-4 text-white animate-pulse">Loading transaction...</p>
    </div>
    <!-- shit broke -->
    <div
      v-else-if="error"
      class="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center"
    >
      <p class="text-red-400">{{ error }}</p>
    </div>

    <!-- txn -->
    <div v-else-if="txnData" class="space-y-6">
      <!-- head -->
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

      <!-- top -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-zinc-900 rounded-lg p-4">
          <p class="text-sm text-zinc-400">Amount</p>
          <p class="text-2xl font-bold">
            {{ fixMoney(txnData.amount_cents) }}
          </p>
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
          >
            View Organization
          </NuxtLink>
        </div>
      </div>

      <!-- detail -->
      <div class="bg-zinc-900 rounded-lg my-4" v-if="txnData">
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
              <td class="py-2 text-zinc-400">Tags</td>
              <td class="py-2 px-4">
                <span
                  v-for="tag in txnData.tags"
                  :key="tag.id"
                  class="inline-block bg-zinc-700 px-2 py-1 rounded mr-2 text-sm"
                >
                  {{ tag.label }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="isCardCharge" class="bg-zinc-900 rounded-lg p-4">
        <h2 class="text-lg font-semibold mb-4">Card Charge Details</h2>

        <div v-if="cardChargeLoading" class="text-center py-4">
          <p class="text-zinc-400">Loading card details...</p>
        </div>

        <div v-else-if="cardChargeError" class="text-red-400 text-sm">
          {{ cardChargeError }}
        </div>

        <div v-else-if="cardChargeData" class="space-y-4">
          <!-- card -->
          <div class="flex items-center gap-3">
            <img
              :src="cardChargeData.user.photo"
              :alt="cardChargeData.user.full_name"
              class="w-10 h-10 rounded-full"
            />
            <div>
              <p class="font-medium">{{ cardChargeData.user.full_name }}</p>
              <p v-if="cardChargeData.user.admin" class="text-sm text-red-400">
                Admin Card User
              </p>
              <p v-else class="text-sm text-zinc-400">Card User</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-zinc-400">Card ID</p>
              <p class="font-mono">{{ cardChargeData.card.id }}</p>
            </div>
            <div>
              <p class="text-sm text-zinc-400">Charge ID</p>
              <p class="font-mono">{{ cardChargeData.id }}</p>
            </div>
          </div>
          <!-- coming later
          <div class="flex justify-end">
            <NuxtLink
              :to="`/app/crd/${cardChargeData.card.id}`"
              class="text-blue-400 hover:underline font-semibold"
              >View Card</NuxtLink
            >
          </div>-->
        </div>
      </div>
    </div>
  </div>
</template>
