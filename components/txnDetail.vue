<template>
  <div class="bg-zinc-900 rounded-lg p-6">
    <div class="flex items-center mb-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          d="M9.1 9.25L4.05 6.425L12 2l7.95 4.425L14.9 9.25q-.575-.6-1.325-.925T12 8t-1.575.325T9.1 9.25m1.9 12.2L3 17V8.125L8.125 11q-.075.25-.1.488T8 12q0 1.375.825 2.45T11 15.875zM12 14q-.825 0-1.412-.587T10 12t.588-1.412T12 10t1.413.588T14 12t-.587 1.413T12 14m1 7.45v-5.575q1.35-.35 2.175-1.425T16 12q0-.275-.025-.513t-.1-.487L21 8.125V17z"
        />
      </svg>
      <h2 class="text-lg font-semibold ml-1">HCB Goggles</h2>
    </div>

    <div v-if="loading" class="text-center">
      <div class="flex flex-col items-center justify-center py-12">
        <svg
          class="animate-spin h-8 w-8 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <p class="mt-4 text-white animate-pulse">Loading details...</p>
      </div>
    </div>
    <div v-else-if="error" class="text-red-400 text-center">
      {{ error }}
    </div>
    <div v-else>
      <div v-if="props.type === 'card_charge'">
        <p class="text-zinc-400 mb-4">
          This appears to be a <b>card transaction</b>, where
          {{ detail.user.full_name }} used a card registered with HCB to make a
          purchase of {{ fixMoney(detail.amount_cents, true) }} on
          {{ date(detail.date) }}. Here are the details I could find:
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex items-center">
            <span class="text-zinc-400 w-1/3">Charge ID</span>
            <span class="text-white w-2/3">{{ detail.id }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-zinc-400 w-1/3">Amount</span>
            <span class="text-white w-2/3">{{
              fixMoney(detail.amount_cents, true)
            }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-zinc-400 w-1/3">Date</span>
            <span class="text-white w-2/3">{{ date(detail.date) }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-zinc-400 w-1/3">Card Owner</span>
            <div class="flex items-center w-2/3">
              <img
                :src="detail.user.photo"
                alt="User Photo"
                class="w-6 h-6 rounded-lg mr-2"
              />
              <span class="text-white">{{ detail.user.full_name }}</span>
            </div>
          </div>
          <div class="flex items-center">
            <span class="text-zinc-400 w-1/3">Organization</span>
            <span class="text-white w-2/3">
              <NuxtLink
                :to="`/app/org/${detail.organization.id}`"
                class="text-blue-400 hover:underline"
                >View Organization</NuxtLink
              >
            </span>
          </div>
          <div class="flex items-center">
            <span class="text-zinc-400 w-1/3">Card ID</span>
            <span class="text-white w-2/3">{{ detail.card.id }}</span>
          </div>
        </div>
      </div>
      <div v-else-if="props.type === 'transfer'">
        <p class="text-zinc-400 mb-4">
          This appears to be a <b>transfer</b>, where a total of
          {{ fixMoney(detail.amount_cents, true) }} was transferred on
          {{ date(detail.date) }} and it's current status is
          <b>{{ detail.status }}</b
          >. Here are the details I could find:
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex items-center">
            <span class="text-zinc-400 w-1/3">Transfer ID</span>
            <span class="text-white w-2/3">{{ detail.id }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-zinc-400 w-1/3">Object</span>
            <span class="text-white w-2/3">{{ detail.object }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-zinc-400 w-1/3">Amount</span>
            <span class="text-white w-2/3">{{
              fixMoney(detail.amount_cents, true)
            }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-zinc-400 w-1/3">Date</span>
            <span class="text-white w-2/3">{{ date(detail.date) }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-zinc-400 w-1/3">Status</span>
            <span class="text-white w-2/3">{{ detail.status }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-zinc-400 w-1/3">Sent to</span>
            <span class="text-white w-2/3">
              <NuxtLink
                :to="`/app/org/${detail.organization.id}`"
                class="text-blue-400 hover:underline"
                >View Organization</NuxtLink
              >
            </span>
          </div>
        </div>
      </div>
      <div v-else-if="props.type === 'donation'">
        <p class="text-zinc-400 mb-4">
          This appears to be a <b>donation</b>, where
          {{ detail.donor.name }} donated
          {{ fixMoney(detail.amount_cents, true) }} on
          {{ date(detail.date) }} and it is set as a
          <b>{{ detail.recurring ? "recurring" : "one-time" }}</b> donation.
          Here are the details I could find:
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex items-center">
            <span class="text-zinc-400 w-1/3">Donation ID</span>
            <a :href="detail.href" class="text-white w-2/3">{{ detail.id }}</a>
          </div>
          <div class="flex items-center">
            <span class="text-zinc-400 w-1/3">Sent to</span>
            <span class="text-white w-2/3">
              <NuxtLink
                :to="`/app/org/${detail.organization.id}`"
                class="text-blue-400 hover:underline"
                >View Organization</NuxtLink
              >
            </span>
          </div>
          <div class="flex items-center">
            <span class="text-zinc-400 w-1/3">Amount</span>
            <span class="text-white w-2/3">{{
              fixMoney(detail.amount_cents, true)
            }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-zinc-400 w-1/3">Donor</span>
            <span class="text-white w-2/3"
              >{{ detail.donor.name }}
              <span v-if="detail.donor.anonymous">(Anonymous)</span></span
            ><!-- this might break if it actually happens, but I could not find any transactions to test it on so fug it we ball-->
          </div>
          <div class="flex items-center">
            <span class="text-zinc-400 w-1/3">Date</span>
            <span class="text-white w-2/3">{{ date(detail.date) }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-zinc-400 w-1/3">Status</span>
            <span class="text-white w-2/3">{{ detail.status }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-zinc-400 w-1/3">Recurring</span>
            <span class="text-white w-2/3">{{
              detail.recurring ? "Yes" : "No"
            }}</span>
          </div>
        </div>
      </div>
      <div v-else-if="props.type === 'invoice'">
        <p class="text-zinc-400 mb-4">
          This appears to be an <b>invoice</b>, where
          {{ detail.sponsor.name }} was made to pay
          {{ fixMoney(detail.amount_cents, true) }} which was due on
          {{ date(detail.date) }}. Here are the details I could find:
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex items-center">
            <span class="text-zinc-400 w-1/3">Invoice ID</span>
            <a :href="detail.href" class="text-white w-2/3">{{ detail.id }}</a>
          </div>
          <div class="flex items-center">
            <span class="text-zinc-400 w-1/3">Organization</span>
            <span class="text-white w-2/3">
              <NuxtLink
                :to="`/app/org/${detail.organization.id}`"
                class="text-blue-400 hover:underline"
                >View Organization</NuxtLink
              >
            </span>
          </div>
          <div class="flex items-center">
            <span class="text-zinc-400 w-1/3">Amount</span>
            <span class="text-white w-2/3">{{
              fixMoney(detail.amount_cents, true)
            }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-zinc-400 w-1/3">Sponsor</span>
            <span class="text-white w-2/3">{{ detail.sponsor.name }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-zinc-400 w-1/3">Date</span>
            <span class="text-white w-2/3">{{ date(detail.date) }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-zinc-400 w-1/3">Status</span>
            <span class="text-white w-2/3">{{ detail.status }}</span>
          </div>
        </div>
      </div>
      <div v-else-if="props.type === 'check'">
        <p class="text-zinc-400 mb-4">
          This appears to be a <b>check</b> with an amount of
          {{ fixMoney(detail.amount_cents, true) }} issued on
          {{ date(detail.date) }}. Here are the details I could find:
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex items-center">
            <span class="text-zinc-400 w-1/3">Check ID</span>
            <a :href="detail.href" class="text-white w-2/3">{{ detail.id }}</a>
          </div>
          <div class="flex items-center">
            <span class="text-zinc-400 w-1/3">Organization</span>
            <span class="text-white w-2/3">
              <NuxtLink
                :to="`/app/org/${detail.organization.id}`"
                class="text-blue-400 hover:underline"
                >View Organization</NuxtLink
              >
            </span>
          </div>
          <div class="flex items-center">
            <span class="text-zinc-400 w-1/3">Amount</span>
            <span class="text-white w-2/3">{{
              fixMoney(detail.amount_cents, true)
            }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-zinc-400 w-1/3">Date</span>
            <span class="text-white w-2/3">{{ date(detail.date) }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-zinc-400 w-1/3">Status</span>
            <span class="text-white w-2/3">{{ detail.status }}</span>
          </div>
        </div>
      </div>
      <div v-else-if="props.type === 'ach_transfer'">
        <p class="text-zinc-400 mb-4">
          This appears to be an
          <b>Automated Clearing House (ACH) transfer</b> transferring
          {{ fixMoney(detail.amount_cents, true) }} on
          {{ date(detail.date) }} to {{ detail.beneficiary.name }}. Here are the
          details I could find:
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex items-center">
            <span class="text-zinc-400 w-1/3">ACH Transfer ID</span>
            <a :href="detail.href" class="text-white w-2/3">{{ detail.id }}</a>
          </div>
          <div class="flex items-center">
            <span class="text-zinc-400 w-1/3">Organization</span>
            <span class="text-white w-2/3">
              <NuxtLink
                :to="`/app/org/${detail.organization.id}`"
                class="text-blue-400 hover:underline"
                >View Organization</NuxtLink
              >
            </span>
          </div>
          <div class="flex items-center">
            <span class="text-zinc-400 w-1/3">Amount</span>
            <span class="text-white w-2/3">{{
              fixMoney(detail.amount_cents, true)
            }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-zinc-400 w-1/3">Beneficiary</span>
            <span class="text-white w-2/3">{{ detail.beneficiary.name }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-zinc-400 w-1/3">Date</span>
            <span class="text-white w-2/3">{{ date(detail.date) }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-zinc-400 w-1/3">Status</span>
            <span class="text-white w-2/3">{{ detail.status }}</span>
          </div>
        </div>
      </div>
      <!-- fug it it borked-->
      <div v-else>
        <p class="text-zinc-400">
          Hmm, I'm not sure what this transaction is. It appears to be a
          <b>{{ detail.object }}</b> but I am not sure how to analyze it. Here
          is the endpoint I contacted:
          <a
            :href="`https://hcb.hackclub.com/api/v3/${props.type}s/${props.id}`"
            class="text-blue-400 hover:underline"
            target="_blank"
            ><code>{{
              `https://hcb.hackclub.com/api/v3/${props.type}s/${props.id}`
            }}</code></a
          >. You might be able to find more information there.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  type: {
    type: String,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
});

const detail = ref<any | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const getDetail = async () => {
  loading.value = true;
  try {
    const response = await fetch(
      `https://hcb.hackclub.com/api/v3/${props.type}s/${props.id}`,
      { headers: { Accept: "application/json" } }
    );
    if (!response.ok)
      throw new Error(`I am unable to analyze this ${props.type}`);
    detail.value = await response.json();
    console.log(detail.value);
    console.log(props.type);
  } catch (e) {
    error.value = e instanceof Error ? e.message : props.type;
    console.error(e);
  } finally {
    loading.value = false;
  }
};

onMounted(getDetail);

const date = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};
</script>
