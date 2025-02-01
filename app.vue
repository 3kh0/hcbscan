<script setup lang="ts">
useHead({
  link: [
    // maybe this helps with speeding things up
    { rel: "preconnect", href: "https://gmtafnkeeufkevbeoazv.supabase.co" },
    { rel: "preconnect", href: "https://bank-hackclub.s3.amazonaws.com" },
    { rel: "preconnect", href: "https://i2.wp.com" },
    { rel: "preconnect", href: "https://hcb.hackclub.com" },
    { rel: "preconnect", href: "https://gravatar.com" },
    { rel: "preconnect", href: "https://data.3kh0.net" },
  ],
  script: [
    {
      src: "https://data.3kh0.net/script.js",
      "data-website-id": "01b4df61-3635-489f-988d-933b06b23d73",
      defer: true,
    },
  ],
});
</script>
<template>
  <div class="min-h-screen bg-zinc-950 text-white p-8">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
