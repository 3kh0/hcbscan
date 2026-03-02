<script setup lang="ts">
  const props = defineProps<{ src?: string | null }>();
  const origin = useRequestURL().origin;

  const isHcbImage = ref(false);

  const normalizedSrc = computed(() => {
    const s = props.src;
    if (!s) {
      isHcbImage.value = false;
      return s;
    }

    let u: URL;
    try {
      u = new URL(s);
    } catch {
      isHcbImage.value = false;
      return s;
    }

    if (
      u.hostname === "hcb.hackclub.com" &&
      (u.pathname.startsWith("/storage/blobs/redirect/") ||
        u.pathname.startsWith("/storage/representations/redirect/"))
    ) {
      const id = u.pathname.split("/")[4];
      if (id) {
        isHcbImage.value = true;
        return `${origin}/api/hcb-image/${id}`;
      }
    }

    isHcbImage.value = false;

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
  <img v-if="isHcbImage" v-bind="$attrs" :src="normalizedSrc" />
  <NuxtImg v-else v-bind="$attrs" :src="normalizedSrc" />
</template>
