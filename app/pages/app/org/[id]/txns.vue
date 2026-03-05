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

  const errMsg = (e: unknown) =>
    e instanceof Error ? e.message : "An unknown error occurred.";

  async function load(page = 1, append = false) {
    try {
      (page === 1 ? loading : loading2).value = true;
      const data = await hcbFetch(
        `api/v3/organizations/${orgId.value}/transactions?per_page=${perPage}&page=${page}`
      );
      if (data.length < perPage) hasMore.value = false;
      transactions.value = append
        ? [...transactions.value, ...data]
        : data;
      currentPage.value = page;
    } catch (e) {
      error.value = errMsg(e);
    } finally {
      loading.value = false;
      loading2.value = false;
    }
  }

  async function loadOrg() {
    try {
      orgData.value = await hcbFetch(
        `api/v3/organizations/${orgId.value}`
      );
    } catch (e) {
      error.value = errMsg(e);
    }
  }

  function loadMore() {
    if (loading2.value || !hasMore.value) return;
    load(currentPage.value + 1, true);
  }

  const mt = ref(null);
  onMounted(() => {
    loadOrg();
    load();

    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !loading2.value && hasMore.value) loadMore();
      },
      { threshold: 0.5 }
    );

    watch(mt, (el) => {
      if (el) obs.observe(el);
    });

    onBeforeUnmount(() => {
      if (mt.value) obs.unobserve(mt.value);
      obs.disconnect();
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
      <Spinner />
      <p class="mt-4 text-white animate-pulse">Loading transactions...</p>
    </div>

    <div v-else-if="error">
      <ErrorBanner :message="error" />
    </div>

    <div v-else>
      <div class="text-center mb-6">
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
        <p class="text-zinc-500 text-sm mt-2">
          {{ transactions.length }} transaction{{
            transactions.length !== 1 ? "s" : ""
          }}
          loaded
        </p>
      </div>

      <div class="bg-zinc-900 rounded-lg overflow-hidden">
        <TxnList
          :transactions="transactions"
          :loading="loading"
        />
      </div>

      <div
        v-if="loading2"
        class="flex justify-center p-4 bg-zinc-900 border-t border-zinc-800/50 rounded-b-lg"
      >
        <Spinner :size="5" color="text-zinc-400" />
      </div>

      <div v-if="hasMore" ref="mt" class="h-10"></div>

      <div
        v-if="!hasMore && transactions.length > 0"
        class="text-center text-zinc-500 text-sm py-4"
      >
        End of transactions
      </div>
    </div>
  </div>
</template>
