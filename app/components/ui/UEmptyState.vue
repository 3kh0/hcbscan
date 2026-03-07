<script setup lang="ts">
  defineProps<{
    message?: string;
  }>();
</script>

<template>
  <div
    class="bg-surface-1 rounded-xl border border-border py-12 text-center text-text-muted text-sm"
  >
    <slot>{{ message || "Nothing to show" }}</slot>
  </div>
</template>
