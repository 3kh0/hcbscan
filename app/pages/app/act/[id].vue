<script setup lang="ts">
  const route = useRoute();
  const activityId = route.params.id;

  const {
    data: activityData,
    error: fetchError,
    status,
  } = useAsyncData(
    `act-${activityId}`,
    () => hcbFetch(`api/v3/activities/${activityId}`),
    { server: false }
  );

  const loading = computed(() => status.value === "pending");
  const error = computed(() =>
    fetchError.value
      ? "Failed to fetch activity as this activity does not exist."
      : null
  );

  const pageTitle = computed(() =>
    activityData.value
      ? `${activityLabel(activityData.value.key)} - HCBScan`
      : "Activity - HCBScan"
  );
  const pageDescription = computed(() =>
    activityData.value
      ? `Activity ${activityData.value.id} performed by ${
          activityData.value.user?.full_name || "unknown"
        } for ${activityData.value.organization.name}`
      : "View activity details on HCBScan"
  );

  useSeoMeta({
    title: pageTitle,
    ogTitle: pageTitle,
    description: pageDescription,
    ogDescription: pageDescription,
    ogImage: "https://hcbscan.3kh0.net/readme.png",
    twitterImage: "https://hcbscan.3kh0.net/readme.png",
  });

  const actGridItems = computed(() => {
    if (!activityData.value) return [];
    const a = activityData.value;
    return [
      { label: "ID", value: a.id },
      { label: "Object", value: a.object },
      { label: "Action", value: activityLabel(a.key) },
      {
        label: "Timestamp",
        value: `${a.created_at} ${date(a.created_at)}`,
      },
    ];
  });
</script>

<template>
  <div class="mx-auto">
    <div v-if="loading" class="flex flex-col items-center justify-center py-12">
      <Spinner />
      <p class="mt-4 text-white animate-pulse">Loading activity...</p>
    </div>

    <div v-else-if="error">
      <ErrorBanner :message="error" />
    </div>

    <div v-else-if="activityData" class="space-y-6">
      <UPageHeader
        :title="activityData.id"
        :subtitle="activityLabel(activityData.key)"
        mono
      >
        <template #actions>
          <span class="text-text-secondary text-sm">{{
            date(activityData.created_at)
          }}</span>
        </template>
      </UPageHeader>

      <UCard>
        <h2 class="text-sm text-text-secondary mb-3">Organization</h2>
        <div class="flex items-center gap-4">
          <SafeNuxtImg
            v-if="activityData.organization.logo"
            :src="activityData.organization.logo"
            :alt="activityData.organization.name"
            width="48"
            height="48"
            class="w-12 h-12 rounded-lg object-cover"
          />
          <div>
            <h2 class="font-semibold text-lg">
              {{ activityData.organization.name }}
            </h2>
            <NuxtLink
              :to="`/app/org/${activityData.organization.id}`"
              class="text-blue-400 hover:underline text-sm font-semibold"
            >
              View Organization
            </NuxtLink>
          </div>
        </div>
      </UCard>

      <UCard v-if="activityData.user">
        <h2 class="text-sm text-text-secondary mb-3">Performed By</h2>
        <NuxtLink
          :to="`/app/usr/${activityData.user.id}`"
          class="flex items-center gap-3 text-blue-400 hover:underline"
        >
          <SafeNuxtImg
            :src="activityData.user.photo"
            :alt="activityData.user.full_name"
            width="40"
            height="40"
            class="w-10 h-10 rounded-full"
          />
          <div>
            <p class="font-medium">{{ activityData.user.full_name }}</p>
            <p v-if="activityData.user.admin" class="text-xs text-red-400">
              Admin
            </p>
          </div>
        </NuxtLink>
      </UCard>

      <UDataGrid :items="actGridItems" />

      <div class="mx-auto">
        <ActDetail :id="activityId" />
      </div>
    </div>
  </div>
</template>
