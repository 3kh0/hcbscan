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
      <div v-if="detail.transaction" class="space-y-6">
        <p class="text-text-secondary mb-4">
          <template v-if="detail.transaction.type === 'card_charge'">
            <template v-if="detail.user"
              ><b>{{ detail.user.full_name }}</b> used an HCB card to
              spend</template
            ><template v-else>An HCB card was used to spend</template>
            {{ fixMoney(detail.transaction.amount_cents, true) }} at
            <b>{{ detail.transaction.memo }}</b> from
            <b>{{ detail.organization.name }}</b
            >.
          </template>
          <template v-else-if="detail.transaction.type === 'donation'">
            <b>{{ detail.organization.name }}</b> received a donation of
            {{ fixMoney(detail.transaction.amount_cents, true) }}.
          </template>
          <template v-else-if="detail.transaction.type === 'transfer'">
            {{ fixMoney(detail.transaction.amount_cents, true) }} was
            transferred
            <template v-if="detail.user">
              by <b>{{ detail.user.full_name }}</b>
            </template>
            for <b>{{ detail.organization.name }}</b
            >.
          </template>
          <template v-else-if="detail.transaction.type === 'ach_transfer'">
            An ACH transfer of
            {{ fixMoney(detail.transaction.amount_cents, true) }} was initiated
            for <b>{{ detail.organization.name }}</b
            >.
          </template>
          <template v-else-if="detail.transaction.type === 'invoice'">
            An invoice of
            {{ fixMoney(detail.transaction.amount_cents, true) }} was
            {{ detail.transaction.pending ? "created" : "paid" }} for
            <b>{{ detail.organization.name }}</b
            >.
          </template>
          <template v-else-if="detail.transaction.type === 'check'">
            A check of
            {{ fixMoney(detail.transaction.amount_cents, true) }} was issued for
            <b>{{ detail.organization.name }}</b
            >.
          </template>
          <template v-else-if="detail.transaction.type === 'hcb_fee'">
            <b>{{ detail.organization.name }}</b> was charged a fiscal
            sponsorship fee of
            {{ fixMoney(detail.transaction.amount_cents, true) }}.
          </template>
          <template v-else>
            A transaction of
            {{ fixMoney(detail.transaction.amount_cents, true) }} occurred for
            <b>{{ detail.organization.name }}</b
            >.
          </template>
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex items-center">
            <span class="text-text-secondary w-1/3">Activity ID</span>
            <span class="text-text-primary w-2/3">{{ detail.id }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-text-secondary w-1/3">Transaction ID</span>
            <NuxtLink
              :to="`/app/txn/${detail.transaction.id}`"
              class="text-blue-400 hover:underline w-2/3"
              >{{ detail.transaction.id }}</NuxtLink
            >
          </div>
          <div class="flex items-center">
            <span class="text-text-secondary w-1/3">Memo</span>
            <span class="text-text-primary w-2/3">{{
              detail.transaction.memo
            }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-text-secondary w-1/3">Amount</span>
            <span class="text-text-primary w-2/3">{{
              fixMoney(detail.transaction.amount_cents, true)
            }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-text-secondary w-1/3">Date</span>
            <span class="text-text-primary w-2/3">{{
              date(detail.created_at)
            }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-text-secondary w-1/3">Status</span>
            <span class="text-text-primary w-2/3"
              ><span
                class="px-3 py-1 rounded-full text-sm"
                :class="
                  detail.transaction.pending
                    ? 'bg-yellow-400/10 text-yellow-400'
                    : 'bg-green-400/10 text-green-400'
                "
              >
                {{ detail.transaction.pending ? "Pending" : "Completed" }}
              </span></span
            >
          </div>
        </div>
        <p class="text-text-secondary mt-4 text-center">
          <NuxtLink
            :to="`/app/txn/${detail.transaction.id}`"
            class="text-blue-400 hover:underline w-2/3"
            >View full details</NuxtLink
          >
        </p>
      </div>
      <div v-else-if="detail.key === 'raw_pending_stripe_transaction.create'">
        <p class="text-text-secondary">
          <template v-if="detail.user"
            ><b>{{ detail.user.full_name }}</b> made a card purchase</template
          ><template v-else>A card purchase was made</template> from
          <b>{{ detail.organization.name }}</b
          >, but the API did not return transaction details. If the charge is
          recent, try the
          <NuxtLink
            :to="`/app/org/${detail.organization.id}`"
            class="text-blue-400 hover:underline"
            >organization's page</NuxtLink
          >.
        </p>
      </div>
      <div v-else>
        <p class="text-text-secondary">
          <template v-if="detail.user"
            ><b>{{ detail.user.full_name }}</b> performed</template
          ><template v-else>Someone performed</template> a
          <b>{{ activityLabel(detail.key) }}</b> action for
          <b>{{ detail.organization.name }}</b> on
          {{ date(detail.created_at) }}. No additional details are available.
        </p>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
  const props = defineProps({
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
      detail.value = await hcbFetch(`api/v3/activities/${props.id}`);
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Failed to load activity";
    } finally {
      loading.value = false;
    }
  };

  onMounted(getDetail);
</script>
