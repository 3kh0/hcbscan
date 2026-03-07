<script setup lang="ts">
  defineProps<{
    title: string;
    subtitle?: string;
    image?: string;
    imageAlt?: string;
    mono?: boolean;
  }>();
</script>

<template>
  <div class="flex items-center gap-4 mb-6">
    <slot name="image">
      <SafeNuxtImg
        v-if="image"
        :src="image"
        :alt="imageAlt || title"
        width="48"
        height="48"
        class="h-12 w-12 rounded-xl object-cover shrink-0"
      />
    </slot>
    <div class="min-w-0">
      <h1
        :class="[
          'font-bold text-3xl text-text-primary truncate',
          mono && 'font-mono text-xl',
        ]"
      >
        {{ title }}
      </h1>
      <p v-if="subtitle" class="text-text-secondary text-sm mt-0.5">
        {{ subtitle }}
      </p>
      <slot name="after-title" />
    </div>
    <div class="ml-auto shrink-0">
      <slot name="actions" />
    </div>
  </div>
</template>
