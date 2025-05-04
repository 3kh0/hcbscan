<template>
  <div
    class="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center"
  >
    <div class="flex flex-col items-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-12 w-12 text-red-400 mb-4"
        width="24"
        height="24"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          d="M12 17q.425 0 .713-.288T13 16t-.288-.712T12 15t-.712.288T11 16t.288.713T12 17m-1-4h2V7h-2zm1 9q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m0-2q3.35 0 5.675-2.325T20 12t-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20m0-8"
        />
      </svg>
      <h3 class="text-xl font-bold text-red-400 mb-2">
        {{ title || "Whoops, we stumbled on a error!" }}
      </h3>
      <p class="text-zinc-400">{{ message }}</p>
      <div v-if="debugInfo" class="mt-4">
        <button
          class="text-sm text-blue-400 hover:underline"
          @click="toggleDebug"
        >
          {{ showDebug ? "Hide Debug Info" : "Show Debug Info" }}
        </button>
        <pre
          v-if="showDebug"
          class="text-xs text-zinc-400 overflow-auto p-2 bg-zinc-900 rounded mt-2"
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
