<script setup lang="ts">
  interface Act {
    id: string;
    key: string;
    created_at: string;
    user: { id: string; full_name: string; photo: string } | null;
    organization: { id: string; name: string; logo: string | null };
  }

  defineProps<{ acts: Act[]; loading?: boolean }>();

  const truncId = (id: string) =>
    !id || id.length <= 12 ? id : `${id.slice(0, 6)}…${id.slice(-4)}`;

  function fmtDate(v: string) {
    const d = new Date(v);
    const sec = Math.floor((Date.now() - d.getTime()) / 1000);
    if (sec < 60) return `${sec}s ago`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hrs = Math.floor(min / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year:
        d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    });
  }
</script>

<template>
  <div class="divide-y divide-zinc-800/50">
    <NuxtLink
      v-for="a in acts"
      :key="a.id"
      :to="`/app/act/${a.id}`"
      class="group flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/40 active:bg-zinc-800/60 transition-colors duration-150"
    >
      <UActivityIcon :activity-key="a.key" />

      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <span
            class="text-sm font-medium truncate text-white group-hover:text-blue-400 transition-colors duration-150"
          >
            {{ activityLabel(a.key) }}
          </span>
        </div>
        <div class="flex items-center gap-2 mt-0.5 flex-wrap">
          <span class="text-xs text-zinc-500 font-mono">{{
            truncId(a.id)
          }}</span>
          <span class="text-zinc-700">·</span>
          <span class="text-xs text-zinc-500">{{ fmtDate(a.created_at) }}</span>
          <template v-if="a.user">
            <span class="text-zinc-700">·</span>
            <span class="inline-flex items-center gap-1 text-xs text-zinc-500">
              <SafeNuxtImg
                v-if="a.user.photo"
                :src="a.user.photo"
                :alt="a.user.full_name"
                width="14"
                height="14"
                class="w-3.5 h-3.5 rounded-full"
              />
              {{ a.user.full_name }}
            </span>
          </template>
        </div>
      </div>

      <div
        v-if="a.organization.name"
        class="hidden sm:flex shrink-0 items-center gap-2 max-w-45"
      >
        <SafeNuxtImg
          v-if="a.organization.logo"
          :src="a.organization.logo"
          :alt="a.organization.name"
          width="20"
          height="20"
          class="w-5 h-5 rounded-full shrink-0"
        />
        <span class="text-sm text-zinc-400 truncate">{{
          a.organization.name
        }}</span>
      </div>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-4 w-4 shrink-0 text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all duration-150"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
          clip-rule="evenodd"
        />
      </svg>
    </NuxtLink>

    <div
      v-if="acts.length === 0 && !loading"
      class="py-8 text-center text-zinc-500 text-sm"
    >
      No activities found
    </div>
  </div>
</template>
