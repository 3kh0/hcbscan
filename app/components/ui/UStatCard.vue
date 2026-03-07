<script setup lang="ts">
  withDefaults(
    defineProps<{
      label: string;
      value: string | number;
      change?: number;
      delay?: number;
    }>(),
    { delay: 0 }
  );
</script>

<template>
  <div
    class="bg-surface-1 rounded-xl border border-border p-5 animate-[fade-slide-up_300ms_ease-out_both]"
    :style="{ animationDelay: `${delay}ms` }"
  >
    <div class="flex items-center gap-2 mb-1">
      <p class="text-sm text-text-secondary">{{ label }}</p>
      <span
        v-if="change != null && change !== 0"
        :class="change > 0 ? 'text-accent' : 'text-rose-400'"
        class="text-xs font-medium"
      >
        {{ change > 0 ? "+" : "" }}{{ change.toFixed(0) }}%
      </span>
    </div>
    <p class="text-2xl font-bold tabular-nums text-text-primary">{{ value }}</p>
    <slot />
  </div>
</template>
