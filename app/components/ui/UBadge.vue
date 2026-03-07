<script setup lang="ts">
  withDefaults(
    defineProps<{
      variant?: "green" | "yellow" | "red" | "zinc" | "blue";
      size?: "sm" | "md";
    }>(),
    { variant: "zinc", size: "sm" }
  );

  const v: Record<string, string> = {
    green: "bg-green-500/10 text-green-400 border-green-500/20",
    yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
    zinc: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };

  const s: Record<string, string> = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };
</script>

<template>
  <span
    :class="[
      'inline-flex items-center font-semibold rounded-full border',
      v[variant!],
      s[size!],
    ]"
  >
    <slot />
  </span>
</template>
