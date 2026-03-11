<template>
  <UCard>
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
          class="animate-spin h-8 w-8 text-text-primary"
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
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <p class="mt-4 text-text-primary animate-pulse">Loading details...</p>
      </div>
    </div>
    <div v-else-if="error" class="text-red-400 text-center">
      {{ error }}
    </div>
    <div v-else>
      <div v-if="props.type === 'card_charge'">
        <p class="text-text-secondary mb-4">
          <template v-if="detail.user"
            ><b>{{ detail.user.full_name }}</b> used an HCB card to
            spend</template
          ><template v-else>An HCB card was used to spend</template>
          {{ fixMoney(detail.amount_cents, true) }} at
          <b>{{ detail.memo }}</b> on {{ date(detail.date) }}.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex items-center">
            <span class="text-text-secondary w-1/3">Charge ID</span>
            <span class="text-text-primary w-2/3">{{ detail.id }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-text-secondary w-1/3">Amount</span>
            <span class="text-text-primary w-2/3">{{
              fixMoney(detail.amount_cents, true)
            }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-text-secondary w-1/3">Date</span>
            <span class="text-text-primary w-2/3">{{ date(detail.date) }}</span>
          </div>
          <div v-if="detail.user" class="flex items-center">
            <span class="text-text-secondary w-1/3">Card Owner</span>
            <NuxtLink
              :to="`/app/usr/${detail.user.id}`"
              class="flex items-center w-2/3 text-blue-400 hover:underline"
            >
              <SafeNuxtImg
                :src="detail.user.photo"
                alt="User Photo"
                width="24"
                height="24"
                class="w-6 h-6 rounded-lg mr-2"
              />
              <span>{{ detail.user.full_name }}</span>
            </NuxtLink>
          </div>
          <div class="flex items-center">
            <span class="text-text-secondary w-1/3">Organization</span>
            <span class="text-text-primary w-2/3">
              <NuxtLink
                :to="`/app/org/${detail.organization.id}`"
                class="text-blue-400 hover:underline"
                >View Organization</NuxtLink
              >
            </span>
          </div>
          <div v-if="detail.card" class="flex items-center">
            <span class="text-text-secondary w-1/3">Card ID</span>
            <span class="text-text-primary w-2/3">{{ detail.card.id }}</span>
          </div>
        </div>
      </div>
      <div v-else-if="props.type === 'transfer'">
        <p class="text-text-secondary mb-4">
          {{ fixMoney(detail.amount_cents, true) }} was transferred on
          {{ date(detail.date) }}, currently <b>{{ detail.status }}</b
          >.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex items-center">
            <span class="text-text-secondary w-1/3">Transfer ID</span>
            <span class="text-text-primary w-2/3">{{ detail.id }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-text-secondary w-1/3">Amount</span>
            <span class="text-text-primary w-2/3">{{
              fixMoney(detail.amount_cents, true)
            }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-text-secondary w-1/3">Memo</span>
            <span class="text-text-primary w-2/3">{{ detail.memo }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-text-secondary w-1/3">Date</span>
            <span class="text-text-primary w-2/3">{{ date(detail.date) }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-text-secondary w-1/3">Status</span>
            <span class="text-text-primary w-2/3">{{ detail.status }}</span>
          </div>
          <div v-if="detail.organization" class="flex items-center">
            <span class="text-text-secondary w-1/3">Organization</span>
            <span class="text-text-primary w-2/3">
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
        <p class="text-text-secondary mb-4">
          <template v-if="detail.donor && !detail.donor.anonymous"
            ><b>{{ detail.donor.name }}</b> donated</template
          ><template v-else>An anonymous donor gave</template>
          {{ fixMoney(detail.amount_cents, true) }} on
          {{ date(detail.date) }} as a
          <b>{{ detail.recurring ? "recurring" : "one-time" }}</b> donation.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex items-center">
            <span class="text-text-secondary w-1/3">Donation ID</span>
            <a :href="detail.href" class="text-text-primary w-2/3">{{
              detail.id
            }}</a>
          </div>
          <div v-if="detail.organization" class="flex items-center">
            <span class="text-text-secondary w-1/3">Organization</span>
            <span class="text-text-primary w-2/3">
              <NuxtLink
                :to="`/app/org/${detail.organization.id}`"
                class="text-blue-400 hover:underline"
                >View Organization</NuxtLink
              >
            </span>
          </div>
          <div class="flex items-center">
            <span class="text-text-secondary w-1/3">Amount</span>
            <span class="text-text-primary w-2/3">{{
              fixMoney(detail.amount_cents, true)
            }}</span>
          </div>
          <div v-if="detail.donor" class="flex items-center">
            <span class="text-text-secondary w-1/3">Donor</span>
            <span class="text-text-primary w-2/3">
              {{ detail.donor.anonymous ? "Anonymous" : detail.donor.name }}
            </span>
          </div>
          <div class="flex items-center">
            <span class="text-text-secondary w-1/3">Date</span>
            <span class="text-text-primary w-2/3">{{ date(detail.date) }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-text-secondary w-1/3">Status</span>
            <span class="text-text-primary w-2/3">{{ detail.status }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-text-secondary w-1/3">Recurring</span>
            <span class="text-text-primary w-2/3">{{
              detail.recurring ? "Yes" : "No"
            }}</span>
          </div>
        </div>
      </div>
      <div v-else-if="props.type === 'invoice'">
        <p class="text-text-secondary mb-4">
          <template v-if="detail.sponsor"
            ><b>{{ detail.sponsor.name }}</b> was invoiced</template
          ><template v-else>An invoice was created</template> for
          {{ fixMoney(detail.amount_cents, true) }}, due on
          {{ date(detail.date) }}.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex items-center">
            <span class="text-text-secondary w-1/3">Invoice ID</span>
            <a :href="detail.href" class="text-text-primary w-2/3">{{
              detail.id
            }}</a>
          </div>
          <div class="flex items-center">
            <span class="text-text-secondary w-1/3">Organization</span>
            <span class="text-text-primary w-2/3">
              <NuxtLink
                :to="`/app/org/${detail.organization.id}`"
                class="text-blue-400 hover:underline"
                >View Organization</NuxtLink
              >
            </span>
          </div>
          <div class="flex items-center">
            <span class="text-text-secondary w-1/3">Amount</span>
            <span class="text-text-primary w-2/3">{{
              fixMoney(detail.amount_cents, true)
            }}</span>
          </div>
          <div v-if="detail.sponsor" class="flex items-center">
            <span class="text-text-secondary w-1/3">Sponsor</span>
            <span class="text-text-primary w-2/3">{{
              detail.sponsor.name
            }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-text-secondary w-1/3">Date</span>
            <span class="text-text-primary w-2/3">{{ date(detail.date) }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-text-secondary w-1/3">Status</span>
            <span class="text-text-primary w-2/3">{{ detail.status }}</span>
          </div>
        </div>
      </div>
      <div v-else-if="props.type === 'check'">
        <p class="text-text-secondary mb-4">
          A check for {{ fixMoney(detail.amount_cents, true) }} was issued on
          {{ date(detail.date) }}.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex items-center">
            <span class="text-text-secondary w-1/3">Check ID</span>
            <a :href="detail.href" class="text-text-primary w-2/3">{{
              detail.id
            }}</a>
          </div>
          <div class="flex items-center">
            <span class="text-text-secondary w-1/3">Organization</span>
            <span class="text-text-primary w-2/3">
              <NuxtLink
                :to="`/app/org/${detail.organization.id}`"
                class="text-blue-400 hover:underline"
                >View Organization</NuxtLink
              >
            </span>
          </div>
          <div class="flex items-center">
            <span class="text-text-secondary w-1/3">Amount</span>
            <span class="text-text-primary w-2/3">{{
              fixMoney(detail.amount_cents, true)
            }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-text-secondary w-1/3">Date</span>
            <span class="text-text-primary w-2/3">{{ date(detail.date) }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-text-secondary w-1/3">Status</span>
            <span class="text-text-primary w-2/3">{{ detail.status }}</span>
          </div>
        </div>
      </div>
      <div v-else-if="props.type === 'ach_transfer'">
        <p class="text-text-secondary mb-4">
          {{ fixMoney(detail.amount_cents, true) }} was sent via ACH
          <template v-if="detail.beneficiary">
            to <b>{{ detail.beneficiary.name }}</b> </template
          >on {{ date(detail.date) }}.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex items-center">
            <span class="text-text-secondary w-1/3">ACH Transfer ID</span>
            <a :href="detail.href" class="text-text-primary w-2/3">{{
              detail.id
            }}</a>
          </div>
          <div class="flex items-center">
            <span class="text-text-secondary w-1/3">Organization</span>
            <span class="text-text-primary w-2/3">
              <NuxtLink
                :to="`/app/org/${detail.organization.id}`"
                class="text-blue-400 hover:underline"
                >View Organization</NuxtLink
              >
            </span>
          </div>
          <div class="flex items-center">
            <span class="text-text-secondary w-1/3">Amount</span>
            <span class="text-text-primary w-2/3">{{
              fixMoney(detail.amount_cents, true)
            }}</span>
          </div>
          <div v-if="detail.beneficiary" class="flex items-center">
            <span class="text-text-secondary w-1/3">Beneficiary</span>
            <span class="text-text-primary w-2/3">{{
              detail.beneficiary.name
            }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-text-secondary w-1/3">Date</span>
            <span class="text-text-primary w-2/3">{{ date(detail.date) }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-text-secondary w-1/3">Status</span>
            <span class="text-text-primary w-2/3">{{ detail.status }}</span>
          </div>
        </div>
      </div>
      <div v-else-if="props.type === 'hcb_fee'">
        <p class="text-text-secondary mb-4">
          A fiscal sponsorship fee of
          {{ fixMoney(detail.amount_cents, true) }} was charged on
          {{ date(detail.date) }}, currently <b>{{ detail.status }}</b
          >.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex items-center">
            <span class="text-text-secondary w-1/3">Fee ID</span>
            <span class="text-text-primary w-2/3">{{ detail.id }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-text-secondary w-1/3">Amount</span>
            <span class="text-text-primary w-2/3">{{
              fixMoney(detail.amount_cents, true)
            }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-text-secondary w-1/3">Date</span>
            <span class="text-text-primary w-2/3">{{ date(detail.date) }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-text-secondary w-1/3">Status</span>
            <span class="text-text-primary w-2/3">{{ detail.status }}</span>
          </div>
          <div v-if="detail.organization" class="flex items-center">
            <span class="text-text-secondary w-1/3">Organization</span>
            <span class="text-text-primary w-2/3">
              <NuxtLink
                :to="`/app/org/${detail.organization.id}`"
                class="text-blue-400 hover:underline"
                >View Organization</NuxtLink
              >
            </span>
          </div>
        </div>
      </div>
      <div v-else-if="props.type === 'wise_transfer'">
        <p class="text-text-secondary mb-4">
          <template v-if="detail.local_currency && detail.local_amount_cents"
            >{{
              formatLocalCurrency(
                detail.local_amount_cents,
                detail.local_currency
              )
            }}
            ({{ fixMoney(detail.amount_cents, true) }} USD)</template
          ><template v-else>{{ fixMoney(detail.amount_cents, true) }}</template>
          was sent via Wise<template v-if="detail.beneficiary">
            to <b>{{ detail.beneficiary.name }}</b></template
          >
          on {{ date(detail.date) }}.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex items-center">
            <span class="text-text-secondary w-1/3">Wise Transfer ID</span>
            <a :href="detail.href" class="text-text-primary w-2/3">{{
              detail.id
            }}</a>
          </div>
          <div class="flex items-center">
            <span class="text-text-secondary w-1/3">Organization</span>
            <span class="text-text-primary w-2/3">
              <NuxtLink
                :to="`/app/org/${detail.organization.id}`"
                class="text-blue-400 hover:underline"
                >View Organization</NuxtLink
              >
            </span>
          </div>
          <div class="flex items-center">
            <span class="text-text-secondary w-1/3">Amount (USD)</span>
            <span class="text-text-primary w-2/3">{{
              fixMoney(detail.amount_cents, true)
            }}</span>
          </div>
          <div
            v-if="detail.local_currency && detail.local_amount_cents"
            class="flex items-center"
          >
            <span class="text-text-secondary w-1/3">Local Amount</span>
            <span class="text-text-primary w-2/3">{{
              formatLocalCurrency(
                detail.local_amount_cents,
                detail.local_currency
              )
            }}</span>
          </div>
          <div v-if="detail.beneficiary" class="flex items-center">
            <span class="text-text-secondary w-1/3">Beneficiary</span>
            <span class="text-text-primary w-2/3">{{
              detail.beneficiary.name
            }}</span>
          </div>
          <div v-if="detail.user" class="flex items-center">
            <span class="text-text-secondary w-1/3">Sent By</span>
            <NuxtLink
              :to="`/app/usr/${detail.user.id}`"
              class="flex items-center w-2/3 text-blue-400 hover:underline"
            >
              <SafeNuxtImg
                :src="detail.user.photo"
                alt="User Photo"
                width="24"
                height="24"
                class="w-6 h-6 rounded-lg mr-2"
              />
              <span>{{ detail.user.full_name }}</span>
            </NuxtLink>
          </div>
          <div class="flex items-center">
            <span class="text-text-secondary w-1/3">Date</span>
            <span class="text-text-primary w-2/3">{{ date(detail.date) }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-text-secondary w-1/3">Status</span>
            <span class="text-text-primary w-2/3">{{ detail.status }}</span>
          </div>
        </div>
      </div>
      <div v-else-if="props.type === 'wire_transfer'">
        <p class="text-text-secondary mb-4">
          <template v-if="detail.local_currency && detail.local_amount_cents"
            >{{
              formatLocalCurrency(
                detail.local_amount_cents,
                detail.local_currency
              )
            }}
            ({{ fixMoney(detail.amount_cents, true) }} USD)</template
          ><template v-else>{{ fixMoney(detail.amount_cents, true) }}</template>
          was sent via wire transfer<template v-if="detail.beneficiary">
            to <b>{{ detail.beneficiary.name }}</b></template
          >
          on {{ date(detail.date) }}.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex items-center">
            <span class="text-text-secondary w-1/3">Wire Transfer ID</span>
            <a :href="detail.href" class="text-text-primary w-2/3">{{
              detail.id
            }}</a>
          </div>
          <div class="flex items-center">
            <span class="text-text-secondary w-1/3">Organization</span>
            <span class="text-text-primary w-2/3">
              <NuxtLink
                :to="`/app/org/${detail.organization.id}`"
                class="text-blue-400 hover:underline"
                >View Organization</NuxtLink
              >
            </span>
          </div>
          <div class="flex items-center">
            <span class="text-text-secondary w-1/3">Amount (USD)</span>
            <span class="text-text-primary w-2/3">{{
              fixMoney(detail.amount_cents, true)
            }}</span>
          </div>
          <div
            v-if="detail.local_currency && detail.local_amount_cents"
            class="flex items-center"
          >
            <span class="text-text-secondary w-1/3">Local Amount</span>
            <span class="text-text-primary w-2/3">{{
              formatLocalCurrency(
                detail.local_amount_cents,
                detail.local_currency
              )
            }}</span>
          </div>
          <div v-if="detail.beneficiary" class="flex items-center">
            <span class="text-text-secondary w-1/3">Beneficiary</span>
            <span class="text-text-primary w-2/3">{{
              detail.beneficiary.name
            }}</span>
          </div>
          <div v-if="detail.user" class="flex items-center">
            <span class="text-text-secondary w-1/3">Sent By</span>
            <NuxtLink
              :to="`/app/usr/${detail.user.id}`"
              class="flex items-center w-2/3 text-blue-400 hover:underline"
            >
              <SafeNuxtImg
                :src="detail.user.photo"
                alt="User Photo"
                width="24"
                height="24"
                class="w-6 h-6 rounded-lg mr-2"
              />
              <span>{{ detail.user.full_name }}</span>
            </NuxtLink>
          </div>
          <div class="flex items-center">
            <span class="text-text-secondary w-1/3">Date</span>
            <span class="text-text-primary w-2/3">{{ date(detail.date) }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-text-secondary w-1/3">Status</span>
            <span class="text-text-primary w-2/3">{{ detail.status }}</span>
          </div>
        </div>
      </div>
      <div v-else>
        <p class="text-text-secondary">
          This transaction is of type <b>{{ detail.object || props.type }}</b
          >, which HCB Goggles does not yet support. You can view the raw data
          at
          <a
            :href="buildApiUrl(`api/v3/${props.type}s/${props.id}`)"
            class="text-blue-400 hover:underline"
            target="_blank"
            ><code>{{
              buildApiUrl(`api/v3/${props.type}s/${props.id}`)
            }}</code></a
          >.
        </p>
      </div>
    </div>
  </UCard>
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
      detail.value = await hcbFetch(`api/v3/${props.type}s/${props.id}`);
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : `Unable to analyze this ${props.type}`;
    } finally {
      loading.value = false;
    }
  };

  onMounted(getDetail);

  const formatLocalCurrency = (cents: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(Math.abs(cents) / 100);
  };

  const date = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
</script>
