const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

const activityLabels: Record<string, string> = {
  "ach_transfer.create": "ACH transfer created",
  "ach_transfer.failed": "ACH transfer failed",
  "ach_transfer.rejected": "ACH transfer rejected",
  "check_deposit.create": "Check deposited",
  "comment.create": "Comment added",
  "comment.destroy": "Comment deleted",
  "comment.update": "Comment updated",
  "disbursement.create": "Transfer created",
  "disbursement.rejected": "Transfer rejected",
  "donation.paid": "Donation received",
  "employee.create": "Employee added",
  "event.create": "Organization created",
  "increase_check.create": "Check mailed",
  "increase_check.rejected": "Check rejected",
  "invoice.create": "Invoice created",
  "invoice.paid": "Invoice paid",
  "organizer_position_invite.create": "Organizer invited",
  "raw_pending_stripe_transaction.create": "Card transaction",
  "reimbursement_expense.approved": "Expense approved",
  "reimbursement_report.approved": "Reimbursement approved",
  "reimbursement_report.create": "Reimbursement submitted",
  "reimbursement_report.review_requested": "Reimbursement review requested",
  "wire.create": "Wire transfer created",
  "wire.failed": "Wire transfer failed",
  "wire.rejected": "Wire transfer rejected",
  "wise_transfer.create": "Wise transfer created",
  "wise_transfer.failed": "Wise transfer failed",
  "wise_transfer.rejected": "Wise transfer rejected",
};

function activityLabel(key: string): string {
  return activityLabels[key] || key.replace(/[_.]/g, " ");
}

interface SlackBlock {
  type: string;
  text?: { type: string; text: string };
  accessory?: {
    type: string;
    image_url?: string;
    alt_text?: string;
  };
  image_url?: string;
  alt_text?: string;
  elements?: Array<{
    type: string;
    text?: string | { type: string; text: string };
    url?: string;
    style?: string;
    image_url?: string;
    alt_text?: string;
  }>;
}

export function slackup(): boolean {
  return Boolean(SLACK_WEBHOOK_URL);
}

async function sendSlackMessage(
  text: string,
  blocks?: SlackBlock[]
): Promise<void> {
  if (!SLACK_WEBHOOK_URL) return;

  try {
    await fetch(SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, blocks }),
    });
  } catch (err: any) {
    console.error("[slack] failed to send message:", err.message);
  }
}

function proxyImageUrl(src: string | null | undefined): string | null {
  if (!src) return null;
  let u: URL;
  try {
    u = new URL(src);
  } catch {
    return null;
  }

  if (
    u.hostname === "hcb.hackclub.com" &&
    (u.pathname.startsWith("/storage/blobs/redirect/") ||
      u.pathname.startsWith("/storage/representations/redirect/"))
  ) {
    const id = u.pathname.split("/")[4];
    if (id) return `https://hcbscan.3kh0.net/api/hcb-image/${id}`;
  }

  return src;
}

export async function notifyNewActivity(act: {
  id: string;
  key: string;
  created_at: string;
  user: { id: string; full_name: string; photo?: string | null } | null;
  organization: { id: string; name: string; logo?: string | null } | null;
  transaction?: {
    id: string;
    amount_cents: number;
    memo: string;
    type: string;
    pending: boolean;
  } | null;
}): Promise<void> {
  if (!slackup()) return;

  const user = act.user?.full_name || "Unknown";
  const org = act.organization?.name || "Unknown";
  const ts = Math.floor(new Date(act.created_at).getTime() / 1000);

  const label = activityLabel(act.key);
  const orgLogo = proxyImageUrl(act.organization?.logo);

  const headerBlock: SlackBlock = {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `*📡 ${label}*\nby *${user}* in *${org}*\n<!date^${ts}^{date_short_pretty} at {time}|${act.created_at}>`,
    },
  };

  if (orgLogo) {
    headerBlock.accessory = {
      type: "image",
      image_url: orgLogo,
      alt_text: org,
    };
  }

  const blocks: SlackBlock[] = [headerBlock];

  if (act.transaction) {
    const amt = (Math.abs(act.transaction.amount_cents) / 100).toLocaleString(
      "en-US",
      { style: "currency", currency: "USD" }
    );
    const sign = act.transaction.amount_cents < 0 ? "-" : "+";
    const memo = act.transaction.memo || "No memo";

    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Amount:* ${sign}${amt}\n*Memo:* ${memo}`,
      },
    });
  }

  const contextElements: SlackBlock["elements"] = [];
  const userPhoto = proxyImageUrl(act.user?.photo);
  if (userPhoto) {
    contextElements.push({
      type: "image",
      image_url: userPhoto,
      alt_text: user,
    });
  }
  contextElements.push({
    type: "mrkdwn",
    text: `${user} - Powered by <https://github.com/3kh0/hcbscan|HCBScan>`,
  });

  blocks.push(
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "View on HCBScan" },
          url: `https://hcbscan.3kh0.net/app/act/${act.id}`,
          style: "primary",
        },
      ],
    },
    {
      type: "context",
      elements: contextElements,
    }
  );

  await sendSlackMessage(`📡 ${label} by ${user} in ${org}`, blocks);
}

interface OrgPayload {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  category: string | null;
  balance: number;
}

function orgBlocks(
  headline: string,
  org: OrgPayload,
  extra?: string
): SlackBlock[] {
  const bal = (org.balance / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
  const cat = org.category ? ` (${org.category})` : "";
  const logo = proxyImageUrl(org.logo);

  const header: SlackBlock = {
    type: "section",
    text: {
      type: "mrkdwn",
      text: extra
        ? `*${headline}*\n*${org.name}*${cat}\nBalance: ${bal}\n\n${extra}`
        : `*${headline}*\n*${org.name}*${cat}\nBalance: ${bal}`,
    },
  };
  if (logo) {
    header.accessory = { type: "image", image_url: logo, alt_text: org.name };
  }

  return [
    header,
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "View on HCBScan" },
          url: `https://hcbscan.3kh0.net/app/org/${org.slug}`,
          style: "primary",
        },
        {
          type: "button",
          text: { type: "plain_text", text: "View on HCB" },
          url: `https://hcb.hackclub.com/${org.slug}`,
        },
      ],
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `Powered by <https://github.com/3kh0/hcbscan|HCBScan>`,
        },
      ],
    },
  ];
}

export async function notifyOrgFrozen(org: OrgPayload): Promise<void> {
  if (!slackup()) return;
  await sendSlackMessage(
    `:bangbang: Organization frozen: ${org.name}`,
    orgBlocks(
      ":bangbang: Organization Frozen",
      org,
      "This is typically due to a ongoing investigation or legal issue. Please exercise caution when interacting with it."
    )
  );
}

export async function notifyNewOrg(org: OrgPayload): Promise<void> {
  if (!slackup()) return;
  await sendSlackMessage(
    `🏢 New organization: ${org.name}`,
    orgBlocks("Indexed New Organization", org)
  );
}
