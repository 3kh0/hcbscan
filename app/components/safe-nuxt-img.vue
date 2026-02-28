<script setup lang="ts">
  const props = defineProps<{ src?: string | null }>();

  const normalizedSrc = computed(() => {
    const s = props.src;
    if (!s) return s;

    let u: URL;
    try {
      u = new URL(s);
    } catch {
      return s;
    }

    if (
      u.hostname !== "hcb.hackclub.com" ||
      !u.pathname.startsWith("/storage/blobs/redirect/")
    )
      return s;

    const id = u.pathname.split("/")[4];
    if (!id) return s;

    const ext = u.pathname.match(/\.([A-Za-z0-9]+)$/)?.[1]?.toLowerCase();
    u.pathname = `/storage/blobs/redirect/${id}/${ext ? `file.${ext}` : "file"}`;
    return u.toString();
  });
</script>

<template>
  <NuxtImg v-bind="$attrs" :src="normalizedSrc" />
</template>
