<script setup>
const runtimeConfig = useRuntimeConfig();
import { getApiDomain } from "~/utils/apiConfig";
import * as math from "~/utils/math.js";

// Check if using non-default domain
const isCustom = computed(() => {
  const domain = getApiDomain();
  return domain && !domain.includes("hcb.hackclub.com");
});

// Get just the hostname part for display
const current = computed(() => {
  try {
    const domain = getApiDomain();
    if (!domain) return "hcb.hackclub.com";

    const url = new URL(domain);
    return url.hostname;
  } catch (e) {
    return getApiDomain() || "hcb.hackclub.com";
  }
});
</script>

<template>
  <div class="max-w-7xl mx-auto">
    <!-- Custom domain warning banner -->
    <div
      v-if="isCustom"
      class="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4 text-center"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="var(--color-red-400)"
          >
            <path
              fill-rule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
          <div class="text-red-400">
            <span class="font-bold"
              >Your settings have you using a custom HCB instance:</span
            >
            <span class="ml-2">{{ current }}</span>
          </div>
        </div>
        <ApiSettings />
      </div>
    </div>

    <div class="flex items-center justify-between mb-6">
      <NuxtLink
        to="/"
        class="flex items-center hover:opacity-80 transition-opacity"
      >
        <img
          src="~/assets/img/hcbscan.png"
          class="w-16 h-16 transform transition-transform duration-200 hover:scale-110 hover:op"
        />
        <div class="ml-4">
          <h1 class="font-bold text-4xl">HCBScan</h1>
          <p class="text-zinc-400">The HCB Explorer (beta)</p>
        </div>
      </NuxtLink>

      <div class="sm:flex flex-col items-end hidden">
        <div class="flex items-center space-x-4">
          <!-- Only show the gear in header if not showing the banner -->
          <ApiSettings v-if="!isCustom" />

          <a
            href="https://hcb.hackclub.com/"
            target="_blank"
            rel="noopener noreferrer"
            class="flex flex-col items-center hover:opacity-80 transition-opacity"
          >
            <p class="text-xl font-bold">This is not HCB</p>
            <p class="text-zinc-400 mt-1">Click here to visit HCB</p>
          </a>
        </div>
      </div>

      <div class="sm:hidden flex-col items-center hidden">
        <div class="flex items-center space-x-3">
          <ApiSettings />

          <a
            href="https://hcb.hackclub.com/"
            target="_blank"
            rel="noopener noreferrer"
            class="flex flex-col items-center hover:opacity-80 transition-opacity"
          >
            <img
              src="~/assets/img/bank.png"
              class="w-16 h-16 transform transition-transform duration-200 hover:scale-110"
            />
          </a>
        </div>
      </div>
    </div>

    <slot />
    <div class="mt-8 text-center text-zinc-400">
      <p class="max-w-3xl mx-auto mb-2">
        Not affiliated, fiscally sponsored, or endorsed by HCB. Do not enter
        your login details on HCBScan, please use the offical HCB at
        <a href="https://hcb.hackclub.com" class="underline" target="_blank"
          >hcb.hackclub.com</a
        >. We only use publicily available data provided by the
        <a
          href="https://hcb.hackclub.com/docs/api/v3"
          class="underline"
          target="_blank"
          >HCB API</a
        >
        .
      </p>
      <p class="max-w-3xl mx-auto mb-2">
        Made with 💚 and two fluffy paws by
        <a href="https://3kh0.net" class="underline" target="_blank">Echo</a>.
        <a
          href="https://github.com/3kh0/hcbscan/"
          class="underline"
          target="_blank"
          >Source on GitHub</a
        >
      </p>
      <p class="max-w-3xl mx-auto mb-2">
        Commit:
        <span class="font-mono">{{ runtimeConfig.public.sha }}</span> Last
        built: {{ relativeTime(runtimeConfig.public.date) }}
      </p>
    </div>
  </div>
</template>
