import crypto from "crypto";

const BASE = "https://hcbscan.3kh0.net";
const IMG = `${BASE}/readme.png`;

export function verifySlackSignature(
  secret: string,
  ts: string,
  body: string,
  sig: string
): boolean {
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) return false;
  const computed = `v0=${crypto.createHmac("sha256", secret).update(`v0:${ts}:${body}`).digest("hex")}`;
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(sig));
}

function money(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

const activityLabels: Record<string, string> = {
  "ach_transfer.create": "ACH transfer created",
  "ach_transfer.failed": "ACH transfer failed",
  "ach_transfer.rejected": "ACH transfer rejected",
  "check_deposit.create": "Check deposited",
  "comment.create": "Comment added",
  "comment.destroy": "Comment deleted",
  "comment.update": "Comment updated",
  "disbursement.create": "Transfer initiated",
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

interface Block {
  type: string;
  text?: { type: string; text: string };
  accessory?: { type: string; image_url: string; alt_text: string };
  elements?: Array<{
    type: string;
    text?: string | { type: string; text: string };
    url?: string;
    style?: string;
    image_url?: string;
    alt_text?: string;
  }>;
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
    if (id) return `${BASE}/api/hcb-image/${id}`;
  }

  return src;
}

type RouteResult = Block[] | null;

const routes: Array<{
  re: RegExp;
  resolve: (m: RegExpMatchArray, url: string) => Promise<RouteResult>;
}> = [
  {
    re: /^\/app\/?$/,
    resolve: async (_m, url) => {
      const s = await $fetch<Record<string, number>>("/api/stats");
      return [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `HCBScan is an open-source explorer for HCB that allows you to search for organizations, view transactions, and explore public financial data across HCB.\n\n*Total Balance:* ${money(s.balance)}\n*Organizations:* ${s.accounts.toLocaleString()}`,
          },
          accessory: {
            type: "image",
            image_url: IMG,
            alt_text: "HCBScan",
          },
        },
      ];
    },
  },
  {
    re: /^\/app\/org\/([^/]+)\/txns\/?$/,
    resolve: async (m, url) => {
      const o = await fetchOrgData(m[1]);
      if (!o) return null;
      const logo = proxyImageUrl(o.logo);
      const cat = o.category ? ` (${o.category})` : "";

      const header: Block = {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*💳 ${o.name} — Transactions*${cat}\n\n*Balance:* ${money(o.balance)}`,
        },
      };
      if (logo) {
        header.accessory = {
          type: "image",
          image_url: logo,
          alt_text: o.name,
        };
      }

      return [
        header,
      ];
    },
  },
  {
    re: /^\/app\/org\/([^/]+)\/?$/,
    resolve: async (m, url) => {
      const o = await fetchOrgData(m[1]);
      if (!o) return null;
      const logo = proxyImageUrl(o.logo);
      const cat = o.category ? ` (${o.category})` : "";

      const header: Block = {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*🏢 ${o.name}*${cat}\n\n*Balance:* ${money(o.balance)}`,
        },
      };
      if (logo) {
        header.accessory = {
          type: "image",
          image_url: logo,
          alt_text: o.name,
        };
      }

      return [
        header,
      ];
    },
  },
  {
    re: /^\/app\/usr\/([^/]+)\/?$/,
    resolve: async (m, url) => {
      const u = await $fetch<{
        name: string;
        avatar?: string;
        orgs?: unknown[];
        netWorth: number;
      }>(`/api/users/${m[1]}`).catch(() => null);
      if (!u) return null;
      const avatar = proxyImageUrl(u.avatar);
      const orgCount = u.orgs?.length || 0;

      const header: Block = {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*👤 ${u.name}*\n\n*Organizations:* ${orgCount}\n*Net Worth:* ${money(u.netWorth)}`,
        },
      };
      if (avatar) {
        header.accessory = {
          type: "image",
          image_url: avatar,
          alt_text: u.name,
        };
      }

      return [
        header,
      ];
    },
  },
  {
    re: /^\/app\/txn\/([^/]+)\/?$/,
    resolve: async (m, url) => {
      const t = await hcbApiFetch(`api/v3/transactions/${m[1]}`);
      if (!t) return null;

      const amtCents = t.amount_cents as number;
      const sign = amtCents < 0 ? "-" : "+";
      const amt = money(Math.abs(amtCents));
      const memo = (t.memo as string) || "No memo";
      const pending = t.pending ? " _(pending)_" : "";
      const orgName = (t.organization?.name as string) || "Unknown";
      const orgLogo = proxyImageUrl(t.organization?.logo as string | null);
      const date = t.date as string;

      const header: Block = {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*💰 ${memo}*${pending}\n\n*Amount:* ${sign}${amt}\n*Organization:* ${orgName}\n*Date:* ${date}`,
        },
      };
      if (orgLogo) {
        header.accessory = {
          type: "image",
          image_url: orgLogo,
          alt_text: orgName,
        };
      }

      return [
        header,
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `${t.type || "Transaction"}`,
            },
          ],
        },
      ];
    },
  },
  {
    re: /^\/app\/act\/([^/]+)\/?$/,
    resolve: async (m, url) => {
      const a = await hcbApiFetch(`api/v3/activities/${m[1]}`);
      if (!a) return null;

      const label = activityLabel(a.key as string);
      const user = (a.user?.full_name as string) || "Unknown";
      const orgName = (a.organization?.name as string) || "Unknown";
      const orgLogo = proxyImageUrl(a.organization?.logo as string | null);
      const userPhoto = proxyImageUrl(a.user?.photo as string | null);
      const ts = Math.floor(
        new Date(a.created_at as string).getTime() / 1000
      );

      const header: Block = {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*📡 ${label}*\nby *${user}* in *${orgName}*\n<!date^${ts}^{date_short_pretty} at {time}|${a.created_at}>`,
        },
      };
      if (orgLogo) {
        header.accessory = {
          type: "image",
          image_url: orgLogo,
          alt_text: orgName,
        };
      }

      const blocks: Block[] = [header];

      if (a.transaction) {
        const txAmtCents = a.transaction.amount_cents as number;
        const txSign = txAmtCents < 0 ? "-" : "+";
        const txAmt = money(Math.abs(txAmtCents));
        const txMemo = (a.transaction.memo as string) || "No memo";

        blocks.push({
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Amount:* ${txSign}${txAmt}\n*Memo:* ${txMemo}`,
          },
        });
      }

      const contextElements: Block["elements"] = [];
      if (userPhoto) {
        contextElements.push({
          type: "image",
          image_url: userPhoto,
          alt_text: user,
        });
      }

      blocks.push({
        type: "context",
        elements: contextElements,
      });

      return blocks;
    },
  },
];

async function fetchOrgData(id: string) {
  const data = await hcbApiFetch(`api/v3/organizations/${id}`);
  if (!data) return null;
  return {
    name: data.name as string,
    category: data.category as string | null,
    balance: (data.balances?.balance_cents || 0) as number,
    logo: (data.logo || null) as string | null,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function hcbApiFetch(path: string): Promise<Record<string, any> | null> {
  try {
    const res = await fetch(`https://hcb.hackclub.com/${path}`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "HCBScan/1.0 (https://hcbscan.3kh0.net)",
      },
    });
    return res.ok ? res.json() : null;
  } catch {
    return null;
  }
}

export async function resolveUnfurl(url: string): Promise<Block[] | null> {
  let path: string;
  try {
    path = new URL(url).pathname;
  } catch {
    return null;
  }
  for (const r of routes) {
    const m = path.match(r.re);
    if (m) return r.resolve(m, url);
  }
  return null;
}

export async function postUnfurl(
  token: string,
  channel: string,
  ts: string,
  unfurls: Record<string, { blocks: unknown[] }>
): Promise<void> {
  try {
    await $fetch("https://slack.com/api/chat.unfurl", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: { channel, ts, unfurls },
    });
  } catch (e: unknown) {
    console.error("[slack-unfurl] chat.unfurl failed:", e);
  }
}
