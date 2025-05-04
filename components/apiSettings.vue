<script setup>
  import { ref, onMounted } from "vue";
  import { getApiDomain, setApiDomain } from "~/utils/apiConfig";

  const apiDomain = ref("");
  const isOpen = ref(false);
  const showSuccessMessage = ref(false);
  const fadeIn = ref(false);

  onMounted(() => {
    apiDomain.value = getApiDomain();
  });

  function open() {
    isOpen.value = true;
    setTimeout(() => {
      fadeIn.value = true;
    }, 50);
  }

  function close() {
    fadeIn.value = false;
    setTimeout(() => {
      isOpen.value = false;
    }, 300);
  }

  function save() {
    setApiDomain(apiDomain.value);

    showSuccessMessage.value = true;
    location.reload();
  }

  function reset() {
    setApiDomain("");
    showSuccessMessage.value = true;
    location.reload();
  }
</script>

<template>
  <div>
    <button
      @click="open"
      class="text-zinc-400 hover:text-white transition api-settings-button"
      title="API Domain Settings"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path
          d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
        ></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    </button>

    <div
      v-if="isOpen"
      class="fixed inset-0 bg-zinc-950 opacity-50 z-50 flex items-center justify-center transition-opacity duration-300"
      :class="{ 'opacity-0': !fadeIn, 'opacity-100': fadeIn }"
      @click="close"
    >
      <div
        class="bg-zinc-900 p-6 rounded-lg max-w-md w-full mx-4 transition-all duration-300 transform"
        :class="{
          'opacity-0 scale-50': !fadeIn,
          'opacity-100 scale-100': fadeIn,
        }"
        @click.stop
      >
        <div>
          <h2 class="text-xl font-semibold mb-4">Settings</h2>

          <p class="text-zinc-400 mb-4">
            If you would like to use a custom HCB instance, you can enter it
            here.
          </p>

          <div class="mb-4">
            <label class="block text-zinc-400 text-sm mb-2">API Domain</label>
            <input
              v-model="apiDomain"
              type="text"
              class="block w-full bg-zinc-900 rounded-lg py-2 px-3 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 border border-zinc-700"
              placeholder="https://hcb.hackclub.com"
            />
          </div>

          <div class="flex space-x-3">
            <button
              @click="save"
              class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition"
            >
              Save
            </button>
            <button
              @click="reset"
              class="bg-zinc-700 hover:bg-zinc-600 text-white py-2 px-4 rounded transition"
            >
              Reset to Default
            </button>
            <button
              @click="close"
              class="bg-zinc-700 hover:bg-zinc-600 text-white py-2 px-4 rounded transition"
            >
              Cancel
            </button>
          </div>

          <div v-if="showSuccessMessage" class="mt-4 text-green-500">
            Settings saved successfully!
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .transform {
    will-change: transform, opacity;
  }
</style>
