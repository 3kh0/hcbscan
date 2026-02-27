<script setup>
  import * as math from "~/utils/math.js";
  const runtimeConfig = useRuntimeConfig();

  const status = ref([]);
  let loading = ref(true);

  const fetchStatus = async () => {
    loading.value = true;
    try {
      status.value = await $fetch("/api/status");
    } catch (e) {
      console.error(e);
    } finally {
      loading.value = false;
    }
  };

  const heart = (itemId) => {
    const item = status.value.find((item) => item.item === itemId);
    return item ? item.online : false;
  };

  const fot = ref(false);
  onMounted(() => {
    fetchStatus();
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
  <div>
    <!-- Sticky nav bar -->
    <header class="sticky top-0 z-50 backdrop-blur-md bg-zinc-950/80 border-b border-zinc-800/80">
      <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <NuxtLink
          to="/app"
          class="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <img
            src="~/assets/img/hcbscan.png"
            class="w-9 h-9 transform transition-transform duration-200 hover:scale-110"
          />
          <div>
            <span class="font-bold text-xl tracking-tight">HCBScan</span>
            <span class="ml-2 text-xs text-zinc-500 hidden sm:inline">beta</span>
          </div>
        </NuxtLink>

        <a
          href="https://hcb.hackclub.com/"
          target="_blank"
          rel="noopener noreferrer"
          class="text-sm px-3 py-1.5 rounded-full border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-all duration-200 hidden sm:flex items-center gap-1.5"
        >
          Visit HCB
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
          </svg>
        </a>
      </div>
    </header>

    <!-- Page content -->
    <div class="max-w-7xl mx-auto px-4 pt-8 pb-4">
      <slot />
    </div>

    <footer
      id="footer"
      class="mt-8 border-t border-zinc-800"
    >
      <div class="max-w-7xl mx-auto px-4 pt-10 pb-10">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase tracking-widest text-zinc-500">About</h3>
            <p class="text-sm text-zinc-400 leading-relaxed">
              HCBScan is an open-source explorer for HCB that allows you to
              search for organizations, view transactions, and explore public
              financial data across HCB. We only use publicly available data
              provided by the
              <a
                href="https://hcb.hackclub.com/docs/api/v3"
                class="text-green-400 hover:text-green-300 transition-colors duration-200"
                target="_blank"
                >HCB API</a
              >.
            </p>
          </div>
          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase tracking-widest text-zinc-500">Links</h3>
            <ul class="space-y-2">
              <li>
                <a
                  href="https://hcb.hackclub.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-sm text-zinc-400 hover:text-white flex items-center gap-2 transition-colors duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-3.5 w-3.5"
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
                  class="text-sm text-zinc-400 hover:text-white flex items-center gap-2 transition-colors duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-3.5 w-3.5"
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
                  class="text-sm text-zinc-400 hover:text-white flex items-center gap-2 transition-colors duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-3.5 w-3.5"
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
            <h3 class="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">Status</h3>
            <div class="space-y-2.5">
              <template v-if="loading">
                <div
                  v-for="i in 3"
                  :key="i"
                  class="flex items-center gap-2 animate-pulse"
                >
                  <div class="w-2 h-2 rounded-full bg-zinc-700"></div>
                  <div class="h-3.5 bg-zinc-800 rounded w-36"></div>
                  <div class="h-3.5 bg-zinc-800 rounded w-14"></div>
                </div>
              </template>
              <template v-else>
                <div class="flex items-center gap-2">
                  <div class="relative">
                    <div
                      class="w-2 h-2 rounded-full"
                      :class="[heart(1) ? 'bg-green-500' : 'bg-red-500']"
                    ></div>
                    <div
                      v-if="heart(1)"
                      class="absolute inset-0 w-2 h-2 rounded-full bg-green-500 animate-ping opacity-75"
                    ></div>
                  </div>
                  <span class="text-sm text-zinc-400">Organization Indexer</span>
                  <span
                    class="text-xs font-medium"
                    :class="[heart(1) ? 'text-green-400' : 'text-red-400']"
                  >{{ heart(1) ? "Online" : "Offline" }}</span>
                </div>

                <div class="flex items-center gap-2">
                  <div class="relative">
                    <div
                      class="w-2 h-2 rounded-full"
                      :class="[heart(2) ? 'bg-green-500' : 'bg-red-500']"
                    ></div>
                    <div
                      v-if="heart(2)"
                      class="absolute inset-0 w-2 h-2 rounded-full bg-green-500 animate-ping opacity-75"
                    ></div>
                  </div>
                  <span class="text-sm text-zinc-400">Activity Indexer</span>
                  <span
                    class="text-xs font-medium"
                    :class="[heart(2) ? 'text-green-400' : 'text-red-400']"
                  >{{ heart(2) ? "Online" : "Offline" }}</span>
                </div>

                <div class="flex items-center gap-2">
                  <div class="relative">
                    <div
                      class="w-2 h-2 rounded-full"
                      :class="[heart(3) ? 'bg-green-500' : 'bg-red-500']"
                    ></div>
                    <div
                      v-if="heart(3)"
                      class="absolute inset-0 w-2 h-2 rounded-full bg-green-500 animate-ping opacity-75"
                    ></div>
                  </div>
                  <span class="text-sm text-zinc-400">Backup Indexers</span>
                  <span
                    class="text-xs font-medium"
                    :class="[heart(3) ? 'text-green-400' : 'text-red-400']"
                  >{{ heart(3) ? "Online" : "Offline" }}</span>
                </div>
              </template>

              <div class="pt-3 mt-1 border-t border-zinc-800">
                <div class="flex items-center gap-2 text-xs text-zinc-500">
                  <span class="font-mono bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">{{ runtimeConfig.public.sha }}</span>
                  <span>·</span>
                  <span>Built {{ relativeTime(runtimeConfig.public.date) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-8 pt-6 border-t border-zinc-800 text-center">
          <p class="text-xs text-zinc-600 max-w-2xl mx-auto leading-relaxed">
            HCBScan is not affiliated, fiscally sponsored, or endorsed by HCB.
            We only use publicly available data. We will never ask for your login details.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>
