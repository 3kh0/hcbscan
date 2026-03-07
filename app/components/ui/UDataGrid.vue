<script setup lang="ts">
  export interface DataGridItem {
    label: string;
    value?: string;
    link?: string;
    external?: boolean;
    slot?: string;
  }

  defineProps<{
    items: DataGridItem[];
  }>();
</script>

<template>
  <div
    class="bg-surface-1 rounded-xl border border-border divide-y divide-border"
  >
    <div
      v-for="(item, i) in items"
      :key="i"
      class="flex items-start gap-4 px-5 py-3.5"
    >
      <span class="text-sm text-text-secondary w-40 shrink-0">{{
        item.label
      }}</span>
      <div class="text-sm text-text-primary min-w-0 flex-1">
        <slot :name="item.slot" v-if="item.slot" />
        <NuxtLink
          v-else-if="item.link && !item.external"
          :to="item.link"
          class="text-blue-400 hover:text-blue-300 transition-colors duration-150"
        >
          {{ item.value }}
        </NuxtLink>
        <a
          v-else-if="item.link && item.external"
          :href="item.link"
          target="_blank"
          rel="noopener noreferrer"
          class="text-blue-400 hover:text-blue-300 transition-colors duration-150 break-all"
        >
          {{ item.value }}
        </a>
        <span v-else>{{ item.value }}</span>
      </div>
    </div>
  </div>
</template>
