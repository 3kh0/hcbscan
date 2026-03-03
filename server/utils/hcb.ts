const BASE = "https://hcb.hackclub.com";
const headers = {
  "User-Agent": "HCBScan/1.0 (https://hcbscan.3kh0.net)",
  Accept: "application/json",
};

// https://github.com/hackclub/hcb/blob/main/config/initializers/rack_attack.rb
const LIMIT = 1000;
const WINDOW = 5 * 60 * 1000;
const BUFFER = 50;
const stamps: number[] = [];
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function prune() {
  const cutoff = Date.now() - WINDOW;
  while (stamps.length && stamps[0] < cutoff) stamps.shift();
}

async function throttle() {
  prune();
  if (stamps.length < LIMIT - BUFFER) return;
  const wait = stamps[0] + WINDOW - Date.now() + 1000;
  if (wait <= 0) return;
  console.log(`[hcb] rate limit approaching (${stamps.length}/${LIMIT}), waiting ${Math.ceil(wait / 1000)}s`);
  await delay(wait);
  prune();
}

async function hfetch(url: string, opts?: RequestInit): Promise<Response> {
  await throttle();
  stamps.push(Date.now());
  const res = await fetch(url, opts);

  if (res.status === 429) {
    const sec = parseInt(res.headers.get("retry-after") || "60", 10);
    const wait = (isNaN(sec) ? 60 : sec) * 1000;
    console.warn(`[hcb] 429 rate limited, waiting ${Math.ceil(wait / 1000)}s`);
    await delay(wait);
    stamps.push(Date.now());
    return fetch(url, opts);
  }

  return res;
}

export async function fetchAllOrgs() {
  let page = 1;
  const orgs: any[] = [];
  const umap: Record<string, any> = {};

  while (true) {
    const res = await hfetch(`${BASE}/api/v3/organizations?page=${page}&per_page=100`, { headers });
    if (!res.ok) throw new Error(`HCB API error: ${res.status}`);
    const data: any[] = await res.json();
    if (!data.length) break;

    for (const o of data) {
      for (const u of o.users || []) {
        if (!umap[u.id])
          umap[u.id] = { id: u.id, name: u.full_name, avatar: u.photo, orgs: {} as Record<string, any> };
        umap[u.id].orgs[o.id] = { id: o.id, name: o.name, logo: o.logo || null };
      }
    }

    orgs.push(...data);
    console.log(`[hcb] fetched page ${page} (${data.length} orgs, ${orgs.length} total)`);
    page++;
    await delay(500);
  }

  const users = Object.values(umap).map((u: any) => ({
    id: u.id,
    name: u.name,
    avatar: u.avatar,
    orgs: Object.values(u.orgs),
  }));

  return { orgs, users };
}

export async function fetchActivities(maxPages = 1, perPage = 15) {
  const all: any[] = [];
  let page = 1;

  while (page <= maxPages) {
    const res = await hfetch(`${BASE}/api/v3/activities?page=${page}&per_page=${perPage}`, { headers });
    if (!res.ok) throw new Error(`HCB API error: ${res.status}`);
    const data: any[] = await res.json();
    if (!data.length) break;

    all.push(...data);
    console.log(`[hcb] fetched activities page ${page} (${data.length} rows)`);
    if (data.length < perPage) break;
    page++;
  }

  return all;
}

export async function fetchOrg(id: string) {
  const res = await hfetch(`${BASE}/api/v3/organizations/${id}`, { headers });
  return res.ok ? res.json() : null;
}
