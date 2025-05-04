<script setup>
  import { getApiDomain, handleQuery } from "~/utils/apiConfig";
  import { supabase } from "~/utils/supabase/supabase";
  import * as math from "~/utils/math.js";
  const runtimeConfig = useRuntimeConfig();

  const status = ref([]);
  let loading = ref(true);

  const fetch = async () => {
    loading.value = true;
    const { data, error } = await supabase
      .from("status-check")
      .select("*")
      .in("item", [1, 2, 3]);
    if (error) {
      console.error(error);
      return;
    }
    loading.value = false;
    status.value = data;
  };

  const heart = (itemId) => {
    const item = status.value.find((item) => item.item === itemId);
    return item ? item.online : false;
  };

  const isCustom = computed(() => {
    const domain = getApiDomain();
    return domain && !domain.includes("hcb.hackclub.com");
  });

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

  const fot = ref(false);
  onMounted(() => {
    handleQuery();
    fetch();
    const observer = new IntersectionObserver(
      ([entry]) => {
        fot.value = entry.isIntersecting;
      },
      { threshold: 0.2 }
    );

    const footer = document.querySelector("#footer");
    if (footer) {
      observer.observe(footer);
    }
  });
</script>

<template>
  <div class="max-w-7xl mx-auto">
    <!--<div
      class="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4 text-center"
    >
      <span class="text-red-400"
        >Due to changes in the HCB API, data may be delayed and/or incorrect.
        These are not issues that I can fix and we are working with the HCB team
        for this to be resolved.</span
      >
    </div>-->
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
        to="/app"
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
    <footer
      id="footer"
      class="mt-12 pb-8 border-t border-zinc-200 dark:border-zinc-800"
    >
      <div class="max-w-7xl mx-auto px-4 pt-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="space-y-4">
            <h3 class="text-xl font-bold">HCBScan</h3>
            <p class="text-zinc-500 dark:text-zinc-400">
              HCBScan is an open-source explorer for HCB that allows you to
              search for organizations, view transactions, and explore public
              financial data across HCB. We only use publicily available data
              provided by the
              <a
                href="https://hcb.hackclub.com/docs/api/v3"
                class="text-green-600 hover:text-green-500 transition-colors duration-200"
                target="_blank"
                >HCB API</a
              >. We do not have control over the data provided by the API.
            </p>
          </div>
          <div class="space-y-4">
            <h3 class="text-xl font-bold">Links</h3>
            <ul class="space-y-2">
              <li>
                <a
                  href="https://hcb.hackclub.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-zinc-500 hover:text-green-500 flex items-center transition-colors duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  Official HCB
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/3kh0/hcbscan/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-zinc-500 hover:text-green-500 flex items-center transition-colors duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                    />
                  </svg>
                  3kh0/hcbscan
                </a>
              </li>
              <li>
                <a
                  href="https://3kh0.net"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-zinc-500 hover:text-green-500 flex items-center transition-colors duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Made with 💚 by Echo
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 class="text-xl font-bold">Status</h3>
            <div class="space-y-2">
              <template v-if="loading">
                <div
                  v-for="i in 3"
                  :key="i"
                  class="flex items-center animate-pulse"
                >
                  <div class="relative mr-2">
                    <div
                      class="w-3 h-3 rounded-full bg-zinc-300 dark:bg-zinc-700"
                    ></div>
                  </div>
                  <div
                    class="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-40"
                  ></div>
                  <div
                    class="ml-2 h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-16"
                  ></div>
                </div>
              </template>
              <template v-else>
                <div class="flex items-center">
                  <div class="relative mr-2">
                    <div
                      class="w-3 h-3 rounded-full"
                      :class="[heart(1) ? 'bg-green-500' : 'bg-red-500']"
                    ></div>
                    <div
                      v-if="heart(1)"
                      class="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping opacity-75"
                    ></div>
                  </div>
                  <span class="text-zinc-500">Organization Indexer: </span>
                  <span
                    class="ml-1 font-medium"
                    :class="[heart(1) ? 'text-green-500' : 'text-red-500']"
                  >
                    {{ heart(1) ? "Online" : "Offline" }}
                  </span>
                </div>

                <div class="flex items-center">
                  <div class="relative mr-2">
                    <div
                      class="w-3 h-3 rounded-full"
                      :class="[heart(2) ? 'bg-green-500' : 'bg-red-500']"
                    ></div>
                    <div
                      v-if="heart(2)"
                      class="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping opacity-75"
                    ></div>
                  </div>
                  <span class="text-zinc-500">Activity Indexer: </span>
                  <span
                    class="ml-1 font-medium"
                    :class="[heart(2) ? 'text-green-500' : 'text-red-500']"
                  >
                    {{ heart(2) ? "Online" : "Offline" }}
                  </span>
                </div>

                <div class="flex items-center">
                  <div class="relative mr-2">
                    <div
                      class="w-3 h-3 rounded-full"
                      :class="[heart(3) ? 'bg-green-500' : 'bg-red-500']"
                    ></div>
                    <div
                      v-if="heart(3)"
                      class="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping opacity-75"
                    ></div>
                  </div>
                  <span class="text-zinc-500">Backup Indexers: </span>
                  <span
                    class="ml-1 font-medium"
                    :class="[heart(3) ? 'text-green-500' : 'text-red-500']"
                  >
                    {{ heart(3) ? "Online" : "Offline" }}
                  </span>
                </div>
              </template>

              <div
                class="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800"
              >
                <div class="flex items-center text-sm text-zinc-400">
                  <span class="font-mono">{{ runtimeConfig.public.sha }}</span>
                  <span class="mx-2">•</span>
                  <span
                    >Last built:
                    {{ relativeTime(runtimeConfig.public.date) }}</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          class="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 text-center text-sm text-zinc-400 mx-auto"
        >
          <p class="max-w-3xl mx-auto">
            HCBScan is not affiliated, fiscally sponsored, or endorsed by HCB.
            We only got a "oh shit, this is so cool" from the HCB team so take
            that for what it is worth. We will never ask for your login details.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>
