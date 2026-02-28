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
      u.hostname === "hcb.hackclub.com" &&
      u.pathname.startsWith("/storage/blobs/redirect/")
    ) {
      const id = u.pathname.split("/")[4];
      if (id) {
        const ext = u.pathname.match(/\.([A-Za-z0-9]+)$/)?.[1]?.toLowerCase();
        u.pathname = `/storage/blobs/redirect/${id}/${ext ? `file.${ext}` : "file"}`;
      }
    }

    if (u.hostname === "gravatar.com" || u.hostname.endsWith(".gravatar.com")) {
      const lp = u.pathname.toLowerCase();
      const m =
        lp.indexOf("%3f") >= 0 ? lp.indexOf("%3f") : lp.indexOf("%253f");
      if (m >= 0) u.pathname = u.pathname.slice(0, m);
      // strip for coolify 400s
      u.search = "";
    }

    return u.toString();
  });
</script>

<template>
  <NuxtImg v-bind="$attrs" :src="normalizedSrc" />
</template>
