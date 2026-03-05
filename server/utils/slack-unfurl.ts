import crypto from "crypto";

const IMG = `https://hcbscan.3kh0.net/readme.png`;

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

interface Block {
  type: string;
  text?: { type: string; text: string };
  accessory?: { type: string; image_url: string; alt_text: string };
  elements?: Array<{ type: string; text: string }>;
}

function blocks(
  title: string,
  desc: string,
  ctx: string,
  img?: string | null
): Block[] {
  const section: Block = {
    type: "section",
    text: { type: "mrkdwn", text: `*${title}*\n${desc}` },
  };
  if (img) {
    section.accessory = { type: "image", image_url: img, alt_text: title };
  }
  return [
    section,
    { type: "context", elements: [{ type: "mrkdwn", text: ctx }] },
  ];
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
      return blocks(
        "HCBScan",
        "The HCB Explorer",
        `Balance: ${money(s.balance)} · ${s.accounts} orgs · <${url}|View on HCBScan>`
      );
    },
  },
  {
    re: /^\/app\/org\/([^/]+)\/txns\/?$/,
    resolve: async (m, url) => {
      const o = await fetchOrgData(m[1]);
      if (!o) return null;
      return blocks(
        `${o.name} — Transactions`,
        o.category || "Organization",
        `Balance: ${money(o.balance)} · <${url}|View on HCBScan>`,
        o.logo
      );
    },
  },
  {
    re: /^\/app\/org\/([^/]+)\/?$/,
    resolve: async (m, url) => {
      const o = await fetchOrgData(m[1]);
      if (!o) return null;
      return blocks(
        `${o.name} on HCBScan`,
        o.category ? `Category: ${o.category}` : "Organization",
        `Balance: ${money(o.balance)} · <${url}|View on HCBScan>`,
        o.logo
      );
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
      return blocks(
        `${u.name} on HCBScan`,
        `${u.orgs?.length || 0} organizations`,
        `Net worth: ${money(u.netWorth)} · <${url}|View on HCBScan>`,
        u.avatar || null
      );
    },
  },
  {
    re: /^\/app\/txn\/([^/]+)\/?$/,
    resolve: async (m, url) => {
      const t = await hcbApiFetch(`api/v3/transactions/${m[1]}`);
      if (!t) return null;
      return blocks(
        `${t.memo || t.id}`,
        `${t.type} · ${money(t.amount_cents)}`,
        `${t.date} · <${url}|View on HCBScan>`,
        IMG
      );
    },
  },
  {
    re: /^\/app\/act\/([^/]+)\/?$/,
    resolve: async (m, url) => {
      const a = await hcbApiFetch(`api/v3/activities/${m[1]}`);
      if (!a) return null;
      return blocks(
        a.key.replace(/[_.]/g, " "),
        `${a.organization?.name || "Unknown"} · ${a.user?.full_name || "Unknown"}`,
        `${a.created_at} · <${url}|View on HCBScan>`,
        a.organization?.logo || IMG
      );
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
