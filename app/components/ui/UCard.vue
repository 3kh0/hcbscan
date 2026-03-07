<script setup lang="ts">
  withDefaults(
    defineProps<{
      padding?: string;
      hover?: boolean;
    }>(),
    { padding: "p-5", hover: false }
  );
</script>

<template>
  <div
    :class="[
      'bg-surface-1 rounded-xl border border-border',
      padding,
      hover &&
        'hover:bg-surface-2 hover:border-surface-3 transition-colors duration-150 cursor-pointer',
    ]"
  >
    <slot />
  </div>
</template>
