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

  const refreshing = ref(false);

  const {
    data: acts,
    error,
    refresh,
  } = await useFetch("/api/activities", {
    params: { limit: 25 },
    transform: (data: RawAct[]) =>
      (data ?? []).map((d) => ({
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
          id: d["Organization ID"],
          name: d["Organization Name"],
          logo: d["Organization Logo"],
        },
      })),
    default: () => [],
  });

  let interval: ReturnType<typeof setInterval> | undefined;

  onMounted(() => {
    interval = setInterval(async () => {
      if (!refreshing.value) {
        refreshing.value = true;
        try {
          await refresh();
        } finally {
          refreshing.value = false;
        }
      }
    }, 30000);
  });

  onUnmounted(() => {
    if (interval) clearInterval(interval);
  });
</script>

<template>
  <UCard padding="p-0">
    <div class="px-4 pt-4 pb-3">
      <div class="flex justify-between items-center">
        <h2 class="text-lg font-semibold">Recent Activities</h2>
        <div class="flex items-center gap-2">
          <span
            v-if="refreshing"
            class="inline-flex items-center gap-1.5 text-xs text-text-secondary"
          >
            <Spinner :size="3" color="text-text-secondary" />
            Refreshing
          </span>
          <NuxtLink
            to="/app/acts"
            class="text-sm text-text-muted hover:text-text-secondary transition-colors duration-150"
          >
            View all →
          </NuxtLink>
        </div>
      </div>
      <p class="text-xs text-text-muted mt-1">
        Here are the most recent activities for all public organizations. Click
        on any activity to view more details about it. New activities will
        appear here in real-time as they happen!
      </p>
    </div>

    <div v-if="error" class="px-4 pb-4">
      <ErrorBanner :message="error.message" />
    </div>

    <TransitionGroup name="list" tag="div">
      <ActsList :acts="acts" :key="acts?.map((a) => a.id).join(',')" />
    </TransitionGroup>
  </UCard>
</template>
