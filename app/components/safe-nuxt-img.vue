<script setup lang="ts">
  const props = defineProps<{ src?: string | null }>();
  const origin = useRequestURL().origin;

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
      if (m >= 0) {
        let dp = u.pathname;
        try {
          dp = decodeURIComponent(u.pathname);
        } catch {}
        const qi = dp.indexOf("?");
        if (qi >= 0) {
          u.pathname = dp.slice(0, qi);
          if (!u.search) u.search = `?${dp.slice(qi + 1)}`;
        } else {
          u.pathname = u.pathname.slice(0, m);
        }
      }
      return `${origin}/api/gravatar/${b64url(u.toString())}`;
    }

    return u.toString();
  });

  function b64url(v: string) {
    let bin = "";
    for (const b of new TextEncoder().encode(v)) bin += String.fromCharCode(b);
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
</script>

<template>
  <NuxtImg v-bind="$attrs" :src="normalizedSrc" />
</template>
