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
  elements?: Array<{
    type: string;
    text?: string | { type: string; text: string };
    url?: string;
    style?: string;
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

export async function notifyNewActivity(act: {
  id: string;
  key: string;
  created_at: string;
  user: { id: string; full_name: string } | null;
  organization: { id: string; name: string; logo?: string | null } | null;
}): Promise<void> {
  if (!slackup()) return;

  const user = act.user?.full_name || "Unknown";
  const org = act.organization?.name || "Unknown";
  const ts = Math.floor(new Date(act.created_at).getTime() / 1000);

  const label = activityLabel(act.key);

  await sendSlackMessage(`📡 ${label} by ${user} in ${org}`, [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*📡 ${label}*\nby *${user}* in *${org}*\n<!date^${ts}^{date_short_pretty} at {time}|${act.created_at}>`,
      },
    },
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
      elements: [
        {
          type: "mrkdwn",
          text: `Powered by <https://github.com/3kh0/hcbscan|HCBScan>`,
        },
      ],
    },
  ]);
}

export async function notifyNewOrg(org: {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  balance: number;
}): Promise<void> {
  if (!slackup()) return;

  const bal = (org.balance / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
  const cat = org.category ? ` (${org.category})` : "";

  await sendSlackMessage(`🏢 New organization: ${org.name}`, [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Indexed New Organization*\n*${org.name}*${cat}\nBalance: ${bal}`,
      },
    },
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
  ]);
}
