<script setup lang="ts">
  interface UserActivity {
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
  const userId = route.params.id;

  const { data: udata, error } = await useFetch(`/api/users/${userId}`);

  const actsPage = ref(1);

  const { data: userActs, status: actsStatus } = await useFetch(
    `/api/users/${userId}/activities`,
    {
      params: { page: actsPage, limit: 25 },
      watch: [actsPage],
      default: () => [] as UserActivity[],
    }
  );

  const hasMoreActs = computed(
    () => (userActs.value as UserActivity[])?.length === 25
  );

  const changeActsPage = (page: number) => {
    actsPage.value = page;
  };

  const idCopied = ref(false);
  const copyUserId = async () => {
    await navigator.clipboard.writeText(String(userId));
    idCopied.value = true;
    setTimeout(() => (idCopied.value = false), 2000);
  };

  const orgSort = ref("balance-desc");
  const sortedOrgs = computed(() => {
    const orgs = [...(udata.value?.orgs || [])];
    switch (orgSort.value) {
      case "balance-desc":
        return orgs.sort(
          (a: any, b: any) => (b.balance ?? 0) - (a.balance ?? 0)
        );
      case "balance-asc":
        return orgs.sort(
          (a: any, b: any) => (a.balance ?? 0) - (b.balance ?? 0)
        );
      case "name-asc":
        return orgs.sort((a: any, b: any) =>
          (a.name || "").localeCompare(b.name || "")
        );
      case "name-desc":
        return orgs.sort((a: any, b: any) =>
          (b.name || "").localeCompare(a.name || "")
        );
      default:
        return orgs;
    }
  });

  const img = useImage();
  const defaultOgImage = "https://hcbscan.3kh0.net/readme.png";

  const pageTitle = computed(() =>
    udata.value?.name
      ? `${udata.value.name} - HCBScan`
      : "User Profile - HCBScan"
  );
  const pageDescription = computed(() =>
    udata.value?.name
      ? `User profile for ${udata.value.name} with ${
          udata.value.orgs?.length || 0
        } organizations on HCBScan`
      : "View user details and associated organizations on HCBScan"
  );
  const ogImg = computed(() => {
    if (!udata.value?.avatar) return defaultOgImage;
    const avatar = udata.value.avatar;
    if (avatar.includes("gravatar.com/avatar")) {
      const parsed = new URL(avatar);
      parsed.searchParams.set("s", "512");
      // Update ui-avatars fallback size if present
      const d = parsed.searchParams.get("d");
      if (d) parsed.searchParams.set("d", d.replace(/\/\d+\//, "/512/"));
      return parsed.toString();
    }
    return `https://hcbscan.3kh0.net${img(avatar, { width: 512, height: 512 })}`;
  });

  useSeoMeta({
    title: pageTitle,
    ogTitle: pageTitle,
    description: pageDescription,
    ogDescription: pageDescription,
    ogImage: ogImg,
    twitterImage: ogImg,
  });
</script>

<template>
  <div class="mx-auto">
    <div v-if="error">
      <ErrorBanner
        :message="
          error.statusCode === 404 ? `User ${userId} not found.` : error.message
        "
      />
    </div>

    <div v-else-if="udata" class="space-y-6">
      <UPageHeader :title="udata.name" :image="udata.avatar">
        <template v-if="!udata.avatar" #image>
          <div
            class="h-12 w-12 bg-surface-2 rounded-xl flex items-center justify-center shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 text-text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        </template>
      </UPageHeader>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <UStatCard label="Net Worth" :value="fixMoney(udata.netWorth)" />
        <UCard>
          <h3 class="text-text-secondary text-sm">User ID</h3>
          <button
            class="flex items-center gap-2 group mt-1"
            @click="copyUserId"
          >
            <p class="font-mono text-sm truncate">{{ userId }}</p>
            <svg
              v-if="!idCopied"
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 shrink-0 text-text-muted group-hover:text-text-secondary transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 shrink-0 text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </button>
        </UCard>
        <UStatCard
          label="Total Activities"
          :value="(udata.activityCount || 0).toLocaleString()"
        />
      </div>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">Organizations</h2>
          <select
            v-if="udata.orgs && udata.orgs.length > 1"
            v-model="orgSort"
            class="bg-surface-2 text-sm text-text-secondary rounded-lg px-3 py-1.5 border border-border focus:outline-none focus:border-surface-3"
          >
            <option value="balance-desc">Balance: High → Low</option>
            <option value="balance-asc">Balance: Low → High</option>
            <option value="name-asc">Name: A → Z</option>
            <option value="name-desc">Name: Z → A</option>
          </select>
        </div>
        <div
          v-if="udata.orgs && udata.orgs.length > 0"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2"
        >
          <NuxtLink
            v-for="org in sortedOrgs"
            :key="org.id"
            :to="`/app/org/${org.id}`"
          >
            <UCard :hover="true" padding="px-3 py-2.5">
              <div class="group flex items-center gap-3">
                <SafeNuxtImg
                  v-if="org.logo"
                  :src="org.logo"
                  :alt="org.name"
                  width="32"
                  height="32"
                  class="shrink-0 h-8 w-8 rounded-lg object-cover"
                />
                <div
                  v-else
                  class="shrink-0 h-8 w-8 bg-surface-2 rounded-lg flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4 text-text-muted"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <div class="min-w-0 flex-1">
                  <p
                    class="text-sm font-medium truncate text-text-primary group-hover:text-blue-400 transition-colors duration-150"
                  >
                    {{ org.name }}
                  </p>
                  <p
                    v-if="org.balance != null"
                    class="text-xs text-text-secondary tabular-nums"
                  >
                    {{ fixMoney(org.balance) }}
                  </p>
                </div>
              </div>
            </UCard>
          </NuxtLink>
        </div>
        <UEmptyState v-else message="No organizations found for this user." />
      </div>

      <!-- User Activities -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold">Recent Activities</h2>
        <UCard>
          <div v-if="actsStatus === 'pending'" class="flex justify-center py-8">
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
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <div
            v-else-if="(userActs as UserActivity[]).length === 0"
            class="text-center py-4"
          >
            <p class="text-text-secondary">
              No activities found for this user.
            </p>
          </div>
          <div v-else class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="text-left text-text-secondary text-sm">
                  <th class="pb-4">ID</th>
                  <th class="pb-4">Action</th>
                  <th class="pb-4">Organization</th>
                  <th class="pb-4">Time</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                <tr
                  v-for="act in userActs as UserActivity[]"
                  :key="act['Activity ID']"
                  class="text-sm"
                >
                  <td class="py-4">
                    <NuxtLink
                      :to="`/app/act/${act['Activity ID']}`"
                      class="text-blue-400 hover:underline font-mono"
                    >
                      {{ act["Activity ID"] }}
                    </NuxtLink>
                  </td>
                  <td class="py-4">{{ activityLabel(act["Key"]) }}</td>
                  <td class="py-4">
                    <NuxtLink
                      v-if="act['Organization ID']"
                      :to="`/app/org/${act['Organization ID']}`"
                      class="text-blue-400 hover:underline"
                    >
                      <div class="flex items-center gap-2">
                        <SafeNuxtImg
                          v-if="act['Organization Logo']"
                          :src="act['Organization Logo']"
                          :alt="act['Organization Name']"
                          width="24"
                          height="24"
                          class="w-6 h-6 rounded-full"
                        />
                        <span>{{ act["Organization Name"] }}</span>
                      </div>
                    </NuxtLink>
                    <span v-else class="text-text-muted">—</span>
                  </td>
                  <td class="py-4 text-text-secondary">
                    <span :title="date(act['Created At'])">
                      {{ relativeTime(act["Created At"]) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </UCard>
        <UPagination
          v-if="(userActs as UserActivity[]).length > 0"
          :page="actsPage"
          :has-next="hasMoreActs"
          :loading="actsStatus === 'pending'"
          @change="changeActsPage"
        />
      </div>
    </div>
  </div>
</template>
