<script setup lang="ts">
  import NProgress from "nprogress";
  import "nprogress/nprogress.css";

  useHead({
    link: [{ rel: "preconnect", href: "https://data.3kh0.net" }],
    script: [
      {
        src: "https://data.3kh0.net/script.js",
        "data-website-id": "01b4df61-3635-489f-988d-933b06b23d73",
        defer: true,
      },
    ],
  });

  const router = useRouter();

  router.beforeEach(() => {
    NProgress.start();
  });

  router.afterEach(() => {
    NProgress.done();
  });
</script>
<template>
  <div class="min-h-screen bg-zinc-950 text-white p-8">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
