<script setup lang="ts">
  const props = defineProps<{
    page: number;
    hasNext?: boolean;
    loading?: boolean;
  }>();

  const emit = defineEmits<{
    change: [page: number];
  }>();
</script>

<template>
  <div
    class="flex items-center justify-between bg-surface-1 rounded-xl border border-border p-4"
  >
    <button
      :disabled="page <= 1 || loading"
      class="px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-40 disabled:cursor-not-allowed bg-surface-2 hover:bg-surface-3 text-text-primary transition-colors duration-150"
      @click="emit('change', page - 1)"
    >
      Previous
    </button>
    <span class="text-sm text-text-secondary tabular-nums"
      >Page {{ page }}</span
    >
    <button
      :disabled="hasNext === false || loading"
      class="px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-40 disabled:cursor-not-allowed bg-surface-2 hover:bg-surface-3 text-text-primary transition-colors duration-150"
      @click="emit('change', page + 1)"
    >
      Next
    </button>
  </div>
</template>
