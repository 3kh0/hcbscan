<script setup lang="ts">
import { useRoute } from "vue-router";

const route = useRoute();
const orgId = computed(() => route.params.id as string);
const orgData = ref<any>(null);
const invoices = ref<any[]>([]);
const loading = ref(true);
const loading2 = ref(false);
const error = ref<string | null>(null);
const hasMore = ref(true);
const currentPage = ref(1);
const perPage = 25;

async function load(page = 1, append = false) {
  try {
    if (page === 1) {
      loading.value = true;
    } else {
      loading2.value = true;
    }

    const response = await fetch(
      buildApiUrl(
        `api/v3/organizations/${orgId.value}/invoices?per_page=${perPage}&page=${page}`
      ),
      {
        method: "GET",
        headers: { Accept: "application/json" },
      }
    );

    if (!response.ok) throw new Error("Failed to load invoices.");

    const data = await response.json();

    if (data.length < perPage) {
      hasMore.value = false;
    }

    if (append) {
      invoices.value = [...invoices.value, ...data];
    } else {
      invoices.value = data;
    }

    currentPage.value = page;
  } catch (e) {
    error.value = e instanceof Error ? e.message : "An unknown error occurred.";
    console.error("Error loading invoices:", error.value);
  } finally {
    loading.value = false;
    loading2.value = false;
  }
}

async function loadOrganization() {
  try {
    const response = await fetch(
      buildApiUrl(`api/v3/organizations/${orgId.value}`),
      {
        method: "GET",
        headers: { Accept: "application/json" },
      }
    );

    if (!response.ok) throw new Error("Failed to load organization data.");

    orgData.value = await response.json();
  } catch (e) {
    error.value = e instanceof Error ? e.message : "An unknown error occurred.";
    console.error("Error loading organization:", error.value);
  }
}

const mt = ref(null);
onMounted(() => {
  loadOrganization();
  load();

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !loading2.value && hasMore.value) {
        load(currentPage.value + 1, true);
      }
    },
    { threshold: 0.5 }
  );

  watch(mt, (el) => {
    if (el) {
      observer.observe(el);
    }
  });

  onBeforeUnmount(() => {
    if (mt.value) {
      observer.unobserve(mt.value);
    }
    observer.disconnect();
  });
});

useHead({
  title: "Organization Invoices - HCBScan",
  meta: [
    {
      name: "description",
      content: "View all invoices for an organization on HCBScan",
    },
  ],
});

watch(orgData, (metadata) => {
  if (metadata) {
    useHead({
      title: `${metadata.name} Invoices - HCBScan`,
      meta: [
        {
          name: "description",
          content: `All invoices for ${metadata.name} on HCBScan`,
        },
      ],
    });
  }
});
</script>

<template>
  <div class="mx-auto">
    <div
      v-if="loading && !orgData"
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
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <p class="mt-4 text-white animate-pulse">Loading invoices...</p>
    </div>

    <div v-else-if="error">
      <ErrorBanner :message="error" />
    </div>

    <div v-else>
      <div class="text-center mb-4">
        <div class="flex items-center justify-center">
          <a :href="orgData?.logo" target="_blank" rel="noreferrer">
            <img
              v-if="orgData?.logo"
              :src="orgData?.logo"
              alt="Logo"
              class="h-12 w-12 mr-4 object-cover rounded-lg"
            />
          </a>
          <h1 class="font-bold text-4xl">{{ orgData?.name }}</h1>
        </div>
      </div>

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
              ID
            </th>
            <th
              class="py-2 px-4 text-left text-zinc-400 border-b border-zinc-700"
            >
              Memo
            </th>
            <th
              class="py-2 px-4 text-left text-zinc-400 border-b border-zinc-700"
            >
              Sponsor
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
          <tr
            v-for="invoice in invoices"
            :key="invoice.id"
            class="hover:bg-zinc-800"
          >
            <td class="py-2 px-4 border-b border-zinc-700">
              {{ new Date(invoice.date).toLocaleDateString() }}
            </td>
            <td class="py-2 px-4 border-b border-zinc-700 font-mono text-xs">
              <NuxtLink
                v-if="invoice.transaction"
                :to="`/app/txn/${invoice.transaction.id}`"
                class="text-blue-400 hover:underline"
              >
                {{ invoice.id }}
                <span class="text-zinc-500">
                  ({{ invoice.transaction.id }})
                </span>
              </NuxtLink>
              <span v-else class="text-zinc-500">{{ invoice.id }}</span>
            </td>
            <td class="py-2 px-4 border-b border-zinc-700">
              <NuxtLink
                v-if="invoice.transaction"
                :to="`/app/txn/${invoice.transaction.id}`"
                class="text-blue-400 hover:underline"
              >
                {{ invoice.memo }}
              </NuxtLink>
              <span v-else>{{ invoice.memo }}</span>
            </td>
            <td class="py-2 px-4 border-b border-zinc-700">
              {{ invoice.sponsor.name }}
            </td>
            <td class="py-2 px-4 border-b border-zinc-700">
              {{ fixMoney(invoice.amount_cents) }}
            </td>
            <td class="py-2 px-4 border-b border-zinc-700">
              <div
                :class="[
                  'px-3 py-1 rounded-full font-semibold text-center text-xs',
                  {
                    'bg-green-500/10 text-green-500': invoice.status === 'paid',
                    'bg-yellow-500/10 text-yellow-500':
                      invoice.status === 'open',
                    'bg-red-500/10 text-red-500': invoice.status === 'void',
                  },
                ]"
              >
                {{ invoice.status.toUpperCase() }}
              </div>
            </td>
          </tr>
          <tr v-if="invoices.length === 0 && !loading">
            <td colspan="6" class="py-8 text-center text-zinc-400">
              No invoices found for this organization
            </td>
          </tr>
        </tbody>
      </table>

      <div
        v-if="loading2"
        class="flex justify-center p-4 bg-zinc-900 mb-6 rounded-bl-lg rounded-br-lg"
      >
        <svg
          class="animate-spin h-6 w-6 text-white"
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
      </div>

      <div v-if="hasMore" ref="mt" class="h-10"></div>

      <div
        v-if="!hasMore && invoices.length > 0"
        class="text-center text-zinc-400 p-4"
      >
        No more invoices to load
      </div>
    </div>
  </div>
</template>
