<template>
  <div
    class="bg-red-500/3 backdrop-blur-sm border border-red-500/8 rounded-2xl shadow-lg shadow-black/20 p-5 text-center"
  >
    <div class="flex flex-col items-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-10 w-10 text-red-400 mb-2"
        width="24"
        height="24"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          d="M12 17q.425 0 .713-.288T13 16t-.288-.712T12 15t-.712.288T11 16t.288.713T12 17m-1-4h2V7h-2zm1 9q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m0-2q3.35 0 5.675-2.325T20 12t-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20m0-8"
        />
      </svg>
      <h3 class="text-base font-semibold text-red-400 mb-1">
        {{ title || "Something went wrong" }}
      </h3>
      <p class="text-sm text-zinc-400">{{ message }}</p>
      <div v-if="debugInfo" class="mt-3">
        <button
          class="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          @click="toggleDebug"
        >
          {{ showDebug ? "Hide debug info" : "Show debug info" }}
        </button>
        <pre
          v-if="showDebug"
          class="text-xs text-zinc-400 overflow-auto p-3 bg-zinc-900 border border-zinc-800 ring-1 ring-red-500/10 rounded-lg mt-2 text-left"
          >{{ debugInfo }}
        </pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Title } from "#components";

  const props = defineProps({
    title: {
      type: String,
      required: false,
    },
    message: {
      type: String,
      required: true,
    },
    debugInfo: {
      type: String,
      required: false,
    },
  });

  const showDebug = ref(false);

  const toggleDebug = () => {
    showDebug.value = !showDebug.value;
  };
</script>
