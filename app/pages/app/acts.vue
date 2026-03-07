<script setup lang="ts">
  interface RawAct {
    "Activity ID": string;
    Key: string;
    "Created At": string;
    "User ID": string | null;
    "User Name": string | null;
    "User Photo": string | null;
    "Organization ID": string | null;
    "Organization Name": string | null;
    "Organization Logo": string | null;
  }

  const route = useRoute();
  const router = useRouter();
  const currentPage = ref(Number(route.query.page) || 1);
  const acts = ref<any[]>([]);
  const initialLoading = ref(true);
  const transitioning = ref(false);
  const error = ref<string | null>(null);

  const mapActs = (data: RawAct[]) =>
    data.map((d) => ({
      id: d["Activity ID"],
      key: d["Key"],
      created_at: d["Created At"],
      user: d["User ID"]
        ? {
            id: d["User ID"],
            full_name: d["User Name"],
            photo: d["User Photo"],
          }
        : null,
      organization: {
        name: d["Organization Name"],
        logo: d["Organization Logo"],
        id: d["Organization ID"],
      },
    }));

  const gimmeData = async (page: number) => {
    try {
      const data = await $fetch("/api/activities", {
        params: { page, limit: 50 },
      });
      acts.value = mapActs(data);
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : "An unknown error occurred.";
      console.error("Error loading activities:", error.value);
    }
  };

  const changePage = async (page: number) => {
    try {
      transitioning.value = true;
      await router.push({ query: { page: page.toString() } });
      await gimmeData(page);
      currentPage.value = page;
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Failed to change page.";
      console.error("Error changing page:", error.value);
    } finally {
      transitioning.value = false;
    }
  };

  watch(
    () => route.query.page,
    (newPage) => {
      const page = Number(newPage) || 1;
      if (page !== currentPage.value) {
        gimmeData(page);
        currentPage.value = page;
      }
    }
  );

  onMounted(async () => {
    await gimmeData(currentPage.value);
    initialLoading.value = false;
  });

  useSeoMeta({
    title: "Recent Activities - HCBScan",
    ogTitle: "Recent Activities - HCBScan",
    description:
      "Browse all recent activities from transparent HCB organizations.",
    ogDescription:
      "Browse all recent activities from transparent HCB organizations.",
    ogImage: "https://hcbscan.3kh0.net/readme.png",
    twitterImage: "https://hcbscan.3kh0.net/readme.png",
  });
</script>

<template>
  <div class="space-y-4">
    <div v-if="error" class="mb-4">
      <ErrorBanner :message="error" />
    </div>

    <UCard v-else padding="p-0">
      <div class="px-4 pt-4 pb-3">
        <h2 class="text-lg font-semibold">Activities list</h2>
        <p class="text-xs text-text-muted mt-1">
          Only showing recent activities from HCB organizations that are in
          Transparency Mode and have opted in to public listing. Due to the
          amount of data, only 50 activities are shown per page.
        </p>
      </div>

      <div
        v-if="initialLoading"
        class="flex flex-col items-center justify-center py-12"
      >
        <Spinner :size="8" />
        <p class="mt-4 text-white animate-pulse">Loading activities...</p>
      </div>

      <div
        v-else
        class="transition-opacity duration-200"
        :class="
          transitioning ? 'opacity-40 pointer-events-none' : 'opacity-100'
        "
      >
        <ActsList :acts="acts" :loading="initialLoading" />
      </div>
    </UCard>

    <UPagination
      :page="currentPage"
      :has-next="true"
      :loading="transitioning"
      @change="changePage"
    />
  </div>
</template>
