<script setup lang="ts">
  useHead({
    title: "HCBScan — Maintenance",
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
  <div
    class="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-8 overflow-auto"
  >
    <div class="text-center max-w-lg">
      <h1 class="text-4xl font-bold mb-4">Under Maintenance</h1>
      <p class="text-zinc-400 text-lg mb-2">
        HCBScan is currently offline for database upgrades. We'll be back shortly. Thanks for your patience!
      </p>
      <img
        src="https://cdn.hackclub.com/019c9ceb-fb79-712e-bc3a-0d1e0109b4a8/2026_02_26_0zr_Kleki.png"
        alt="Maintenance"
        class="mx-auto mt-6 w-48 opacity-80"
      />
    </div>
  </div>
</template>
