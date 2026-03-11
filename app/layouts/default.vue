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
  <div class="max-w-7xl mx-auto">
    <nav class="flex items-center gap-4 mb-6">
      <NuxtLink
        to="/app"
        class="flex items-center shrink-0 hover:opacity-80 transition-opacity"
      >
        <img
          src="~/assets/img/hcbscan.png"
          class="w-9 h-9 transform transition-transform duration-200 hover:scale-105 active:scale-95"
        />
        <span class="ml-2.5 font-bold text-xl hidden sm:inline">HCBScan</span>
      </NuxtLink>

      <div class="flex-1 min-w-0">
        <SearchBar />
      </div>

      <a
        href="https://hcb.hackclub.com/"
        target="_blank"
        rel="noopener noreferrer"
        class="shrink-0 hidden sm:flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
      >
        <span>Not HCB</span>
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
      </a>
    </nav>

    <slot />
    <footer id="footer" class="mt-12 pb-8 border-t border-border">
      <div class="max-w-7xl mx-auto px-4 pt-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="space-y-4">
            <h3 class="text-xl font-bold">About</h3>
            <p class="text-text-secondary">
              HCBScan is an open-source explorer for HCB that allows you to
              search for organizations, view transactions, and explore public
              financial data across HCB. We only use publicly available data
              provided by the
              <a
                href="https://hcb.hackclub.com/docs/api/v3"
                class="text-accent hover:text-accent/80 transition-colors duration-200"
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
                  class="text-text-muted hover:text-accent flex items-center transition-colors duration-200"
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
                  href="/api/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-text-muted hover:text-accent flex items-center transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 0 24 24"><path fill="currentColor" d="M3.53 21.53a.75.75 0 0 1-1.06-1.06l2.01-2.011c-.774-1.073-.908-2.265-.753-3.29c.178-1.172.743-2.2 1.243-2.7l1.5-1.5a.75.75 0 0 1 1.06 0l5.5 5.5a.75.75 0 0 1 0 1.061l-1.5 1.5c-.5.5-1.527 1.065-2.699 1.243c-1.025.155-2.217.02-3.29-.754zm7.5-11a.75.75 0 1 1-1.06-1.06L11.44 8l-.47-.47a.75.75 0 0 1 0-1.06l1.5-1.5c.5-.5 1.527-1.065 2.699-1.243c1.025-.155 2.217-.02 3.29.754l2.01-2.011a.75.75 0 1 1 1.061 1.06l-2.01 2.012c.774 1.072.91 2.264.754 3.29c-.178 1.171-.743 2.198-1.243 2.698l-1.5 1.5a.75.75 0 0 1-1.06 0l-.47-.47l-1.47 1.47a.75.75 0 1 1-1.06-1.06l1.47-1.47l-2.44-2.44z"/></svg>
                  HCBScan API
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/3kh0/hcbscan/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-text-muted hover:text-accent flex items-center transition-colors duration-200"
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
                  class="text-text-muted hover:text-accent flex items-center transition-colors duration-200"
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
                    <div class="w-3 h-3 rounded-full bg-surface-3"></div>
                  </div>
                  <div class="h-4 bg-surface-2 rounded w-40"></div>
                  <div class="ml-2 h-4 bg-surface-2 rounded w-16"></div>
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
                  <span class="text-text-muted">Organization Indexer: </span>
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
                  <span class="text-text-muted">Activity Indexer: </span>
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
                  <span class="text-text-muted">Backup Indexers: </span>
                  <span
                    class="ml-1 font-medium"
                    :class="[heart(3) ? 'text-green-500' : 'text-red-500']"
                  >
                    {{ heart(3) ? "Online" : "Offline" }}
                  </span>
                </div>
              </template>

              <div class="mt-4 pt-4 border-t border-border">
                <div class="flex items-center text-sm text-text-secondary">
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
          class="mt-8 pt-6 border-t border-border text-center text-sm text-text-secondary mx-auto"
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
