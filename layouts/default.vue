<script setup>
const runtimeConfig = useRuntimeConfig();
// import all functions in utils/math.js to use for all pages
import * as math from "~/utils/math.js";
</script>
<template>
  <div class="max-w-7xl mx-auto">
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
      <div class="sm:hidden flex-col items-center hidden">
        <!--todo add mobile support for the hcb redirect-->
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
