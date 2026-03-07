<template>
  <div
    :class="[
      style.bg,
      style.text,
      `w-${size} h-${size}`,
      'rounded-lg flex items-center justify-center',
    ]"
  >
    <svg viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4">
      <template v-if="style.icon === 'card'">
        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
        <path
          fill-rule="evenodd"
          d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
          clip-rule="evenodd"
        />
      </template>
      <template v-else-if="style.icon === 'bank'">
        <path
          fill-rule="evenodd"
          d="M10.496 2.132a1 1 0 00-.992 0l-7 4A1 1 0 003 8v1h14V8a1 1 0 00.496-1.868l-7-4zM5 11v5h2v-5H5zm4 0v5h2v-5H9zm4 0v5h2v-5h-2zM3 17a1 1 0 000 2h14a1 1 0 100-2H3z"
          clip-rule="evenodd"
        />
      </template>
      <template v-else-if="style.icon === 'document'">
        <path
          fill-rule="evenodd"
          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
          clip-rule="evenodd"
        />
      </template>
      <template v-else-if="style.icon === 'mail'">
        <path
          d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"
        />
        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
      </template>
      <template v-else-if="style.icon === 'chat'">
        <path
          fill-rule="evenodd"
          d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7z"
          clip-rule="evenodd"
        />
      </template>
      <template v-else-if="style.icon === 'arrows'">
        <path
          d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z"
        />
      </template>
      <template v-else-if="style.icon === 'heart'">
        <path
          fill-rule="evenodd"
          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
          clip-rule="evenodd"
        />
      </template>
      <template v-else-if="style.icon === 'person'">
        <path
          fill-rule="evenodd"
          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
          clip-rule="evenodd"
        />
      </template>
      <template v-else-if="style.icon === 'building'">
        <path
          fill-rule="evenodd"
          d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
          clip-rule="evenodd"
        />
      </template>
      <template v-else-if="style.icon === 'dollar'">
        <path
          d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"
        />
        <path
          fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
          clip-rule="evenodd"
        />
      </template>
      <template v-else-if="style.icon === 'check'">
        <path
          fill-rule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clip-rule="evenodd"
        />
      </template>
      <template v-else-if="style.icon === 'clipboard'">
        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
        <path
          d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"
        />
      </template>
      <template v-else-if="style.icon === 'globe'">
        <path
          fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z"
          clip-rule="evenodd"
        />
      </template>
      <template v-else-if="style.icon === 'eye'">
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
        <path
          fill-rule="evenodd"
          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
          clip-rule="evenodd"
        />
      </template>
      <template v-else>
        <path
          fill-rule="evenodd"
          d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
          clip-rule="evenodd"
        />
      </template>
    </svg>
  </div>
</template>

<script setup lang="ts">
  type Style = { bg: string; text: string; icon: string };

  const props = withDefaults(
    defineProps<{
      activityKey: string;
      size?: number;
    }>(),
    {
      size: 8,
    }
  );

  const styles: Record<string, Style> = {
    "raw_pending_stripe_transaction.create": {
      bg: "bg-purple-500/10",
      text: "text-purple-400",
      icon: "card",
    },
    "ach_transfer.create": {
      bg: "bg-blue-500/10",
      text: "text-blue-400",
      icon: "bank",
    },
    "ach_transfer.failed": {
      bg: "bg-red-500/10",
      text: "text-red-400",
      icon: "bank",
    },
    "ach_transfer.rejected": {
      bg: "bg-red-500/10",
      text: "text-red-400",
      icon: "bank",
    },
    "check_deposit.create": {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      icon: "document",
    },
    "increase_check.create": {
      bg: "bg-blue-500/10",
      text: "text-blue-400",
      icon: "mail",
    },
    "increase_check.rejected": {
      bg: "bg-red-500/10",
      text: "text-red-400",
      icon: "mail",
    },
    "comment.create": {
      bg: "bg-blue-500/10",
      text: "text-blue-400",
      icon: "chat",
    },
    "comment.destroy": {
      bg: "bg-red-500/10",
      text: "text-red-400",
      icon: "chat",
    },
    "comment.update": {
      bg: "bg-blue-500/10",
      text: "text-blue-400",
      icon: "chat",
    },
    "disbursement.create": {
      bg: "bg-orange-500/10",
      text: "text-orange-400",
      icon: "arrows",
    },
    "disbursement.rejected": {
      bg: "bg-red-500/10",
      text: "text-red-400",
      icon: "arrows",
    },
    "donation.paid": {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      icon: "heart",
    },
    "organizer_position_invite.create": {
      bg: "bg-blue-500/10",
      text: "text-blue-400",
      icon: "person",
    },
    "event.create": {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      icon: "building",
    },
    "invoice.create": {
      bg: "bg-blue-500/10",
      text: "text-blue-400",
      icon: "document",
    },
    "invoice.paid": {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      icon: "dollar",
    },
    "reimbursement_expense.approved": {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      icon: "check",
    },
    "reimbursement_report.approved": {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      icon: "check",
    },
    "reimbursement_report.create": {
      bg: "bg-blue-500/10",
      text: "text-blue-400",
      icon: "clipboard",
    },
    "reimbursement_report.review_requested": {
      bg: "bg-yellow-500/10",
      text: "text-yellow-400",
      icon: "eye",
    },
    "wire.create": {
      bg: "bg-blue-500/10",
      text: "text-blue-400",
      icon: "globe",
    },
    "wire.failed": {
      bg: "bg-red-500/10",
      text: "text-red-400",
      icon: "globe",
    },
    "wire.rejected": {
      bg: "bg-red-500/10",
      text: "text-red-400",
      icon: "globe",
    },
    "wise_transfer.create": {
      bg: "bg-blue-500/10",
      text: "text-blue-400",
      icon: "globe",
    },
    "wise_transfer.failed": {
      bg: "bg-red-500/10",
      text: "text-red-400",
      icon: "globe",
    },
    "wise_transfer.rejected": {
      bg: "bg-red-500/10",
      text: "text-red-400",
      icon: "globe",
    },
  };

  const fallback: Style = {
    bg: "bg-zinc-500/10",
    text: "text-zinc-400",
    icon: "bolt",
  };

  const style = computed(() => styles[props.activityKey] ?? fallback);
</script>
