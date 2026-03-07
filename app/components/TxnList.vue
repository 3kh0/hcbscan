<script setup lang="ts">
  defineProps<{
    transactions: any[];
    loading?: boolean;
  }>();

  function formatDate(s: string) {
    const d = new Date(s);
    const days = Math.floor((Date.now() - d.getTime()) / 864e5);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year:
        d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    });
  }

  const truncId = (id: string) =>
    !id || id.length <= 12 ? id : `${id.slice(0, 6)}…${id.slice(-4)}`;
</script>

<template>
  <div class="divide-y divide-border">
    <NuxtLink
      v-for="txn in transactions"
      :key="txn.id"
      :to="`/app/txn/${txn.id}`"
      class="group flex items-center gap-3 px-4 py-3 hover:bg-surface-2/40 active:bg-surface-2/60 transition-colors duration-150"
    >
      <div
        :class="[
          'shrink-0 flex items-center justify-center w-8 h-8 rounded-lg',
          txn.pending
            ? 'bg-zinc-500/10 text-zinc-400'
            : txn.amount_cents >= 0
              ? 'bg-emerald-500/10 text-emerald-400'
              : 'bg-red-500/10 text-red-400',
        ]"
      >
        <svg
          v-if="txn.pending"
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        <svg
          v-else-if="txn.amount_cents >= 0"
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"
            clip-rule="evenodd"
          />
        </svg>
        <!-- Up arrow for outgoing (negative) -->
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
            clip-rule="evenodd"
          />
        </svg>
      </div>

      <!-- Memo + metadata -->
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <span
            :class="[
              'text-sm font-medium truncate transition-colors duration-150',
              txn.pending
                ? 'text-text-secondary group-hover:text-blue-400'
                : 'text-text-primary group-hover:text-blue-400',
            ]"
          >
            {{ txn.memo || "No memo" }}
          </span>
          <span
            v-if="txn.pending"
            class="shrink-0 inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-zinc-500/10 text-text-secondary border border-zinc-500/20"
          >
            Pending
          </span>
          <span
            v-if="txn.receipts?.missing"
            class="shrink-0 text-[10px] font-semibold tracking-wider text-yellow-400"
          >
            RECEIPT MISSING!
          </span>
        </div>
        <div class="flex items-center gap-2 mt-0.5">
          <span class="text-xs text-text-muted font-mono">
            {{ truncId(txn.id) }}
          </span>
          <span class="text-surface-3">·</span>
          <span class="text-xs text-text-muted">
            {{ formatDate(txn.date) }}
          </span>
          <template v-if="txn.receipts?.count > 0 && !txn.receipts?.missing">
            <span class="text-surface-3">·</span>
            <span
              class="inline-flex items-center gap-0.5 text-xs text-text-muted"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-3 w-3"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                  clip-rule="evenodd"
                />
              </svg>
              {{ txn.receipts.count }}
            </span>
          </template>
          <template v-if="txn.comments?.count > 0">
            <span class="text-surface-3">·</span>
            <span
              class="inline-flex items-center gap-0.5 text-xs text-text-muted"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-3 w-3"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7z"
                  clip-rule="evenodd"
                />
              </svg>
              {{ txn.comments.count }}
            </span>
          </template>
        </div>
      </div>

      <!-- Amount -->
      <div class="shrink-0 text-right">
        <span
          :class="[
            'text-sm font-semibold tabular-nums',
            txn.amount_cents >= 0 ? 'text-emerald-400' : 'text-red-400',
          ]"
        >
          {{ txn.amount_cents >= 0 ? "+" : "" }}{{ fixMoney(txn.amount_cents) }}
        </span>
      </div>

      <!-- Arrow -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-4 w-4 shrink-0 text-text-muted group-hover:text-text-secondary group-hover:translate-x-0.5 transition-all duration-150"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
          clip-rule="evenodd"
        />
      </svg>
    </NuxtLink>

    <div
      v-if="transactions.length === 0 && !loading"
      class="py-8 text-center text-text-muted text-sm"
    >
      No transactions found
    </div>
  </div>
</template>
