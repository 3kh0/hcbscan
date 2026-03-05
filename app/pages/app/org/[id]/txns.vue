<script setup lang="ts">
  const route = useRoute();
  const orgId = computed(() => route.params.id as string);
  const orgData = ref<any>(null);
  const transactions = ref<any[]>([]);
  const loading = ref(true);
  const loading2 = ref(false);
  const error = ref<string | null>(null);
  const hasMore = ref(true);
  const currentPage = ref(1);
  const perPage = 25;

  const { data: orgMeta } = useAsyncData(
    `org-meta-${orgId.value}`,
    async () => {
      const response = await hcbFetch(
        `api/v3/organizations/${orgId.value}`
      );
      return { name: response.name, logo: response.logo };
    },
    { server: false }
  );

  async function load(page = 1, append = false) {
    try {
      if (page === 1) {
        loading.value = true;
      } else {
        loading2.value = true;
      }

      const data = await hcbFetch(
        `api/v3/organizations/${orgId.value}/transactions?per_page=${perPage}&page=${page}`
      );

      if (data.length < perPage) {
        hasMore.value = false;
      }

      if (append) {
        transactions.value = [...transactions.value, ...data];
      } else {
        transactions.value = data;
      }

      currentPage.value = page;
    } catch (e) {
      error.value =
        e instanceof Error
          ? e.message
          : "An unknown error occurred while loading transactions.";
      console.error("Error loading transactions:", error.value);
    } finally {
      loading.value = false;
      loading2.value = false;
    }
  }

  async function loadOrganization() {
    try {
      orgData.value = await hcbFetch(
        `api/v3/organizations/${orgId.value}`
      );
    } catch (e) {
      error.value =
        e instanceof Error
          ? e.message
          : "An unknown error occurred while loading the organization.";
      console.error("Error loading organization:", error.value);
    }
  }

  function loadMoreTransactions() {
    if (loading2.value || !hasMore.value) return;
    load(currentPage.value + 1, true);
  }

  const mt = ref(null);
  onMounted(() => {
    loadOrganization();
    load();

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading2.value && hasMore.value) {
          loadMoreTransactions();
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

  const pageTitle = computed(() =>
    orgMeta.value?.name
      ? `${orgMeta.value.name} Transactions - HCBScan`
      : "Organization Transactions - HCBScan"
  );
  const pageDescription = computed(() =>
    orgMeta.value?.name
      ? `All transactions for ${orgMeta.value.name} on HCBScan`
      : "View all transactions for an organization on HCBScan"
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
      <p class="mt-4 text-white animate-pulse">Loading transactions...</p>
    </div>

    <div v-else-if="error">
      <ErrorBanner :message="error" />
    </div>

    <div v-else>
      <div class="text-center mb-4">
        <div class="flex items-center justify-center">
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
            v-for="txn in transactions"
            :key="txn.id"
            class="hover:bg-zinc-800"
          >
            <td class="py-2 px-4 border-b border-zinc-700">
              {{ new Date(txn.date).toLocaleDateString() }}
            </td>
            <td class="py-2 px-4 border-b border-zinc-700 font-mono text-xs">
              {{ txn.id }}
            </td>
            <td class="py-2 px-4 border-b border-zinc-700">
              <div class="flex items-center gap-2">
                <NuxtLink
                  :to="`/app/txn/${txn.id}`"
                  class="text-blue-400 hover:underline"
                >
                  {{ txn.memo || "No memo" }}
                </NuxtLink>
                <span
                  v-if="txn.receipts?.missing"
                  class="inline-flex items-center gap-0.5 text-xs text-yellow-400 animate-pulse"
                  title="Missing receipt"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-3.5 w-3.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  Missing receipt!
                </span>
                <span
                  v-else-if="txn.receipts?.count > 0"
                  class="inline-flex items-center gap-0.5 text-xs text-zinc-400"
                  title="Receipts"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-3.5 w-3.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  {{ txn.receipts.count }}
                </span>
                <span
                  v-if="txn.comments?.count > 0"
                  class="inline-flex items-center gap-0.5 text-xs text-zinc-400"
                  title="Comments"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-3.5 w-3.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  {{ txn.comments.count }}
                </span>
              </div>
            </td>
            <td class="py-2 px-4 border-b border-zinc-700">
              {{ fixMoney(txn.amount_cents) }}
            </td>
            <td class="py-2 px-4 border-b border-zinc-700">
              <div
                :class="[
                  'px-3 py-1 rounded-full font-semibold text-center text-xs',
                  txn.pending
                    ? 'bg-yellow-500/10 text-yellow-500'
                    : 'bg-green-500/10 text-green-500',
                ]"
              >
                {{ txn.pending ? "Pending" : "Completed" }}
              </div>
            </td>
          </tr>
          <tr v-if="transactions.length === 0 && !loading">
            <td colspan="5" class="py-8 text-center text-zinc-400">
              No transactions found for this organization
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
        v-if="!hasMore && transactions.length > 0"
        class="text-center text-zinc-400 p-4"
      >
        You've reached the end!
      </div>
    </div>
  </div>
</template>

<style scoped>
  table tr:last-child td {
    border-bottom: none;
  }
</style>
