<script setup lang="ts">
  interface Act {
    id: string;
    key: string;
    created_at: string;
    user: { id: string; full_name: string; photo: string } | null;
    organization: { id: string; name: string; logo: string | null };
  }

  defineProps<{ acts: Act[]; loading?: boolean }>();

  type Style = { bg: string; text: string; icon: string };

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
    "wire.failed": { bg: "bg-red-500/10", text: "text-red-400", icon: "globe" },
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
  const s = (k: string) => styles[k] ?? fallback;

  const truncId = (id: string) =>
    !id || id.length <= 12 ? id : `${id.slice(0, 6)}…${id.slice(-4)}`;

  function fmtDate(v: string) {
    const d = new Date(v);
    const sec = Math.floor((Date.now() - d.getTime()) / 1000);
    if (sec < 60) return `${sec}s ago`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hrs = Math.floor(min / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year:
        d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    });
  }
</script>

<template>
  <div class="divide-y divide-zinc-800/50">
    <NuxtLink
      v-for="a in acts"
      :key="a.id"
      :to="`/app/act/${a.id}`"
      class="group flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/40 transition-colors duration-150"
    >
      <div
        :class="[
          'shrink-0 flex items-center justify-center w-8 h-8 rounded-lg',
          s(a.key).bg,
          s(a.key).text,
        ]"
      >
        <svg
          v-if="s(a.key).icon === 'card'"
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
          <path
            fill-rule="evenodd"
            d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
            clip-rule="evenodd"
          />
        </svg>
        <svg
          v-else-if="s(a.key).icon === 'bank'"
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M10.496 2.132a1 1 0 00-.992 0l-7 4A1 1 0 003 8v1h14V8a1 1 0 00.496-1.868l-7-4zM5 11v5h2v-5H5zm4 0v5h2v-5H9zm4 0v5h2v-5h-2zM3 17a1 1 0 000 2h14a1 1 0 100-2H3z"
            clip-rule="evenodd"
          />
        </svg>
        <svg
          v-else-if="s(a.key).icon === 'dollar'"
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"
          />
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
            clip-rule="evenodd"
          />
        </svg>
        <svg
          v-else-if="s(a.key).icon === 'check'"
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clip-rule="evenodd"
          />
        </svg>
        <svg
          v-else-if="s(a.key).icon === 'document'"
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
            clip-rule="evenodd"
          />
        </svg>
        <svg
          v-else-if="s(a.key).icon === 'mail'"
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"
          />
          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
        </svg>
        <svg
          v-else-if="s(a.key).icon === 'chat'"
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7z"
            clip-rule="evenodd"
          />
        </svg>
        <svg
          v-else-if="s(a.key).icon === 'arrows'"
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z"
          />
        </svg>
        <svg
          v-else-if="s(a.key).icon === 'heart'"
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
            clip-rule="evenodd"
          />
        </svg>
        <svg
          v-else-if="s(a.key).icon === 'person'"
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
            clip-rule="evenodd"
          />
        </svg>
        <svg
          v-else-if="s(a.key).icon === 'building'"
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
            clip-rule="evenodd"
          />
        </svg>
        <svg
          v-else-if="s(a.key).icon === 'clipboard'"
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
          <path
            d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"
          />
        </svg>
        <svg
          v-else-if="s(a.key).icon === 'globe'"
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z"
            clip-rule="evenodd"
          />
        </svg>
        <svg
          v-else-if="s(a.key).icon === 'eye'"
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path
            fill-rule="evenodd"
            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
            clip-rule="evenodd"
          />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
            clip-rule="evenodd"
          />
        </svg>
      </div>

      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <span
            class="text-sm font-medium truncate text-white group-hover:text-blue-400 transition-colors duration-150"
          >
            {{ activityLabel(a.key) }}
          </span>
        </div>
        <div class="flex items-center gap-2 mt-0.5 flex-wrap">
          <span class="text-xs text-zinc-500 font-mono">{{
            truncId(a.id)
          }}</span>
          <span class="text-zinc-700">·</span>
          <span class="text-xs text-zinc-500">{{ fmtDate(a.created_at) }}</span>
          <template v-if="a.user">
            <span class="text-zinc-700">·</span>
            <span class="inline-flex items-center gap-1 text-xs text-zinc-500">
              <SafeNuxtImg
                v-if="a.user.photo"
                :src="a.user.photo"
                :alt="a.user.full_name"
                width="14"
                height="14"
                class="w-3.5 h-3.5 rounded-full"
              />
              {{ a.user.full_name }}
            </span>
          </template>
        </div>
      </div>

      <div
        v-if="a.organization.name"
        class="hidden sm:flex shrink-0 items-center gap-2 max-w-45"
      >
        <SafeNuxtImg
          v-if="a.organization.logo"
          :src="a.organization.logo"
          :alt="a.organization.name"
          width="20"
          height="20"
          class="w-5 h-5 rounded-full shrink-0"
        />
        <span class="text-sm text-zinc-400 truncate">{{
          a.organization.name
        }}</span>
      </div>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-4 w-4 shrink-0 text-zinc-600 group-hover:text-zinc-400 transition-colors duration-150"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
          clip-rule="evenodd"
        />
      </svg>
    </NuxtLink>

    <div
      v-if="acts.length === 0 && !loading"
      class="py-8 text-center text-zinc-500 text-sm"
    >
      No activities found
    </div>
  </div>
</template>
