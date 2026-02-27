<script setup lang="ts">
  import { marked } from "marked";
  import { useRoute } from "vue-router";

  const route = useRoute();
  const orgData = ref<any>(null);
  const transactions = ref<any[]>([]);
  const loading = ref(true);
  const txnsLoading = ref(true);
  const error = ref<string | null>(null);
  const isIndexed = ref(true);
  const askIndex = ref(false);

  const pubMsg = computed(() => {
    if (!orgData.value?.public_message) return "";
    const pubMsg = orgData.value.public_message
      .replace(/\]\s*\n\s*\(/g, "](")
      .replace(/\[(.*?)\]\s*\((.*?)\)/g, (_, text, url) => {
        if (url.includes(text)) return `[${text}](${url})`;
        return `[${text}](${url})`;
      })
      .replace(/\[(.*?)\]\s*\((.*?)\)/g, (_, text, url) => `[${text}](${url})`);
    return marked.parse(pubMsg);
  });

  const checkIndex = async (id: string) => {
    try {
      const data = await $fetch(`/api/orgs/${id}/indexed`);
      if (!data.indexed) {
        isIndexed.value = false;
        askIndex.value = true;
      }
    } catch {
      isIndexed.value = false;
      askIndex.value = true;
    }
  };

  const indexRequest = async () => {
    try {
      await $fetch("/api/index-org", {
        method: "POST",
        body: { id: orgData.value.id },
      });
      alert("Sent index request successfully.");
      isIndexed.value = true;
      askIndex.value = false;
    } catch (e) {
      console.error(e);
      alert("Failed to send index request.");
    }
  };

  onMounted(async () => {
    try {
      loading.value = true;

      const isSwitch = route.params.id;
      const response = await fetch(
        buildApiUrl(`api/v3/organizations/${isSwitch}`),
        {
          method: "GET",
          headers: { Accept: "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error("This organization does not exist.");
      }

      orgData.value = await response.json();
      await checkIndex(orgData.value.id);

      const transactionsResponse = await fetch(
        buildApiUrl(
          `api/v3/organizations/${orgData.value.id}/transactions?per_page=25`
        ),
        {
          method: "GET",
          headers: { Accept: "application/json" },
        }
      );

      if (!transactionsResponse.ok) {
        throw new Error("Failed to fetch transactions.");
      }

      transactions.value = await transactionsResponse.json();
      txnsLoading.value = false;
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : "Failed to load organization data.";
      console.error("Error:", error.value);
    } finally {
      loading.value = false;
    }
  });

  useHead({
    title: "Viewing organization - HCBScan",
    meta: [
      {
        name: "description",
        content: "View the details of a specific organization on HCBScan",
      },
    ],
  });

  watch(orgData, (metadata) => {
    if (metadata) {
      useHead({
        title: `${metadata.name} - HCBScan`,
        meta: [
          {
            name: "description",
            content: `Organization ${metadata.name} with ${fixMoney(
              metadata.balances?.balance_cents
            )} raised`,
          },
        ],
      });
    }
  });
</script>

<template>
  <div>
    <!-- Not-indexed callout -->
    <div
      v-if="askIndex"
      class="border border-yellow-500/20 bg-yellow-500/5 rounded-xl p-4 mb-5 flex items-start justify-between gap-4"
    >
      <div class="flex items-start gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <p class="text-sm text-yellow-300">
          This organization isn't in our index yet. Would you like to request indexing?
        </p>
      </div>
      <button
        class="text-sm px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-400 hover:bg-yellow-500/20 transition-colors duration-200 shrink-0"
        @click="indexRequest"
      >
        Index it
      </button>
    </div>

    <!-- Loading -->
    <div
      v-if="loading"
      class="flex flex-col items-center justify-center py-20"
    >
      <svg
        class="animate-spin h-7 w-7 text-green-400"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <p class="mt-3 text-sm text-zinc-400">Loading organization...</p>
    </div>

    <div v-else-if="error">
      <ErrorBanner :message="error" />
    </div>

    <div v-else>
      <!-- Org header -->
      <div class="flex items-center gap-4 mb-6">
        <a :href="orgData?.logo" target="_blank" rel="noreferrer">
          <img
            v-if="orgData?.logo"
            :src="orgData?.logo"
            alt="Logo"
            class="h-14 w-14 object-cover rounded-xl ring-2 ring-white/10 shrink-0"
          />
        </a>
        <div>
          <h1 class="font-bold text-3xl tracking-tight">{{ orgData?.name }}</h1>
          <p v-if="orgData?.slug" class="text-sm text-zinc-500 font-mono mt-0.5">{{ orgData?.slug }}</p>
        </div>
      </div>

      <!-- Balance stat cards -->
      <div class="flex flex-col md:flex-row gap-4 mb-6">
        <div class="bg-zinc-900 border border-zinc-800 ring-1 ring-white/5 border-l-2 border-l-green-500/40 p-5 rounded-xl flex-1">
          <p class="text-xs font-medium text-zinc-400 mb-1.5">Confirmed Balance</p>
          <p class="text-3xl font-bold tracking-tight tabular-nums">
            {{ fixMoney(orgData?.balances?.balance_cents) }}
          </p>
        </div>
        <div class="bg-zinc-900 border border-zinc-800 ring-1 ring-white/5 border-l-2 border-l-green-500/40 p-5 rounded-xl flex-1">
          <p class="text-xs font-medium text-zinc-400 mb-1.5">Total Received</p>
          <p class="text-3xl font-bold tracking-tight tabular-nums">
            {{ fixMoney(orgData?.balances?.total_raised) }}
          </p>
        </div>
      </div>

      <!-- Details table -->
      <div class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden mb-6">
        <div class="px-5 py-4 border-b border-zinc-800">
          <h2 class="text-sm font-semibold tracking-tight">Details</h2>
        </div>
        <table class="w-full text-sm">
          <tbody class="divide-y divide-zinc-800">
            <tr v-if="orgData?.id">
              <td class="py-3 px-5 text-zinc-400 w-44 shrink-0">Internal ID</td>
              <td class="py-3 px-5 text-white font-mono text-xs">{{ orgData?.id }}</td>
            </tr>
            <tr v-if="orgData?.object">
              <td class="py-3 px-5 text-zinc-400">Object</td>
              <td class="py-3 px-5 text-white">{{ orgData?.object }}</td>
            </tr>
            <tr v-if="orgData?.href">
              <td class="py-3 px-5 text-zinc-400">API Link</td>
              <td class="py-3 px-5">
                <a
                  class="text-green-400 hover:text-green-300 underline underline-offset-2 transition-colors break-all"
                  :href="orgData?.href"
                  target="_blank"
                >{{ orgData?.href }}</a>
              </td>
            </tr>
            <tr v-if="orgData?.name">
              <td class="py-3 px-5 text-zinc-400">Name</td>
              <td class="py-3 px-5 text-white">{{ orgData?.name }}</td>
            </tr>
            <tr v-if="orgData?.slug">
              <td class="py-3 px-5 text-zinc-400">URL Slug</td>
              <td class="py-3 px-5">
                <a
                  class="text-green-400 hover:text-green-300 underline underline-offset-2 transition-colors"
                  :href="buildApiUrl(`${orgData?.slug}`)"
                  target="_blank"
                >{{ orgData?.slug }}</a>
              </td>
            </tr>
            <tr v-if="orgData?.website">
              <td class="py-3 px-5 text-zinc-400">Website</td>
              <td class="py-3 px-5">
                <a
                  class="text-green-400 hover:text-green-300 underline underline-offset-2 transition-colors"
                  :href="orgData?.website"
                  target="_blank"
                >{{ orgData?.website }}</a>
              </td>
            </tr>
            <tr v-if="orgData?.category">
              <td class="py-3 px-5 text-zinc-400">Category</td>
              <td class="py-3 px-5">
                <span class="px-2 py-0.5 text-xs rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300">
                  {{ orgData?.category }}
                </span>
              </td>
            </tr>
            <tr v-if="orgData?.transparent !== undefined">
              <td class="py-3 px-5 text-zinc-400">Transparency</td>
              <td class="py-3 px-5">
                <span
                  class="px-2 py-0.5 text-xs rounded-full border"
                  :class="orgData?.transparent
                    ? 'bg-green-500/10 border-green-500/20 text-green-400'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400'"
                >
                  {{ orgData?.transparent ? "Transparent" : "Private" }}
                </span>
              </td>
            </tr>
            <tr v-if="orgData?.demo_mode !== undefined">
              <td class="py-3 px-5 text-zinc-400">Demo Mode</td>
              <td class="py-3 px-5">
                <span
                  class="px-2 py-0.5 text-xs rounded-full border"
                  :class="orgData?.demo_mode
                    ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-500'"
                >
                  {{ orgData?.demo_mode ? "Demo" : "Live" }}
                </span>
              </td>
            </tr>
            <tr v-if="orgData?.logo">
              <td class="py-3 px-5 text-zinc-400">Logo</td>
              <td class="py-3 px-5">
                <a
                  class="text-green-400 hover:text-green-300 underline underline-offset-2 transition-colors break-all text-xs font-mono"
                  :href="orgData?.logo"
                  target="_blank"
                >{{ orgData?.logo }}</a>
              </td>
            </tr>
            <tr v-if="orgData?.donation_header">
              <td class="py-3 px-5 text-zinc-400">Donation Header</td>
              <td class="py-3 px-5">
                <a
                  class="text-green-400 hover:text-green-300 underline underline-offset-2 transition-colors break-all text-xs font-mono"
                  :href="orgData?.donation_header"
                  target="_blank"
                >{{ orgData?.donation_header }}</a>
              </td>
            </tr>
            <tr v-if="orgData?.background_image">
              <td class="py-3 px-5 text-zinc-400">Background Image</td>
              <td class="py-3 px-5">
                <a
                  class="text-green-400 hover:text-green-300 underline underline-offset-2 transition-colors break-all text-xs font-mono"
                  :href="orgData?.background_image"
                  target="_blank"
                >{{ orgData?.background_image }}</a>
              </td>
            </tr>
            <tr v-if="orgData?.balances">
              <td class="py-3 px-5 text-zinc-400">Balances</td>
              <td class="py-3 px-5 text-zinc-300 text-xs leading-relaxed">
                Balance: <span class="text-white">{{ fixMoney(orgData?.balances?.balance_cents) }}</span> ·
                Fee: <span class="text-white">{{ fixMoney(orgData?.balances?.fee_balance_cents) }}</span> ·
                Incoming: <span class="text-white">{{ fixMoney(orgData?.balances?.incoming_balance_cents) }}</span> ·
                Total Received: <span class="text-green-400">{{ fixMoney(orgData?.balances?.total_raised) }}</span>
              </td>
            </tr>
            <tr v-if="orgData?.created_at">
              <td class="py-3 px-5 text-zinc-400">Created</td>
              <td class="py-3 px-5 text-white">{{ new Date(orgData?.created_at).toLocaleDateString() }}</td>
            </tr>
            <tr v-if="orgData?.donation_link">
              <td class="py-3 px-5 text-zinc-400">Donation Link</td>
              <td class="py-3 px-5">
                <a
                  class="text-green-400 hover:text-green-300 underline underline-offset-2 transition-colors"
                  :href="orgData?.donation_link"
                  target="_blank"
                >{{ orgData?.donation_link }}</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Public message -->
      <div v-if="pubMsg" class="mb-6 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div class="px-5 py-4 border-b border-zinc-800">
          <h2 class="text-sm font-semibold tracking-tight">Public Message</h2>
        </div>
        <div class="px-5 py-4 pub text-sm text-zinc-300 leading-relaxed" v-html="pubMsg"></div>
      </div>

      <!-- Users -->
      <div class="mb-6">
        <h2 class="text-sm font-semibold tracking-tight mb-3">Members</h2>
        <div v-if="orgData?.users?.length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div
            v-for="user in orgData?.users"
            :key="user.id"
            class="bg-zinc-900 border border-zinc-800 ring-1 ring-white/5 hover:ring-white/10 p-4 rounded-xl flex items-center gap-3 transition-all duration-200"
          >
            <img
              :src="`${user.photo}`"
              referrerpolicy="no-referrer"
              loading="lazy"
              :alt="user.full_name"
              class="h-10 w-10 rounded-xl object-cover shrink-0 ring-1 ring-white/10"
            />
            <div class="min-w-0">
              <p class="text-sm font-medium truncate">{{ user.full_name }}</p>
              <p v-if="user.admin" class="text-xs text-red-400 mt-0.5">Admin</p>
            </div>
          </div>
        </div>
        <div v-else class="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4">
          <p class="text-sm text-zinc-500">No members found for this organization.</p>
        </div>
      </div>

      <!-- Transactions -->
      <div class="mb-6">
        <div
          v-if="txnsLoading"
          class="flex flex-col items-center justify-center py-12 bg-zinc-900 border border-zinc-800 rounded-xl"
        >
          <svg
            class="animate-spin h-6 w-6 text-green-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p class="mt-3 text-sm text-zinc-400">Loading transactions...</p>
        </div>
        <div v-else class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div class="px-5 py-4 border-b border-zinc-800">
            <h2 class="text-sm font-semibold tracking-tight">Recent Transactions</h2>
          </div>
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-zinc-800">
                <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-zinc-500">Date</th>
                <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-zinc-500">Memo</th>
                <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-zinc-500">Amount</th>
                <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-zinc-500">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-800">
              <tr v-for="txn in transactions" :key="txn.id" class="hover:bg-zinc-800/50 transition-colors duration-100">
                <td class="px-5 py-3 text-zinc-400 text-xs">
                  {{ new Date(txn.date).toLocaleDateString() }}
                </td>
                <td class="px-5 py-3">
                  <NuxtLink
                    :to="`/app/txn/${txn.id}`"
                    class="text-green-400 hover:text-green-300 transition-colors"
                  >{{ txn.memo }}</NuxtLink>
                </td>
                <td class="px-5 py-3 tabular-nums font-medium"
                  :class="txn.amount_cents >= 0 ? 'text-green-400' : 'text-red-400'"
                >
                  {{ fixMoney(txn.amount_cents) }}
                </td>
                <td class="px-5 py-3">
                  <span
                    class="px-2 py-0.5 rounded-full text-xs font-medium border"
                    :class="txn.pending
                      ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                      : 'bg-green-500/10 border-green-500/20 text-green-400'"
                  >
                    {{ txn.pending ? "Pending" : "Completed" }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="px-5 py-3 border-t border-zinc-800 flex items-center gap-4">
            <NuxtLink
              :to="`/app/org/${route.params.id}/txns`"
              class="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
            >
              View all transactions
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
            </NuxtLink>
            <NuxtLink
              :to="`/app/org/${route.params.id}/invoices`"
              class="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
            >
              View all invoices
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .pub :deep(a) {
    color: rgb(74, 222, 128);
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .pub :deep(a:hover) {
    color: rgb(134, 239, 172);
  }
</style>
