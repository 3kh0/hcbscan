const HCB_BASE = "https://hcb.hackclub.com";
const USER_AGENT = "HCBScan/1.0 (https://hcbscan.3kh0.net)";

export const hcbHeaders: Record<string, string> = {
  "User-Agent": USER_AGENT,
  Accept: "application/json",
};

const headers = hcbHeaders;

export async function fetchAllOrgs() {
  let page = 1;
  const allOrgs: any[] = [];
  const userMap: Record<string, any> = {};

  while (true) {
    const res = await fetch(
      `${HCB_BASE}/api/v3/organizations?page=${page}&per_page=100`,
      { headers }
    );
    if (!res.ok) throw new Error(`HCB API error: ${res.status}`);
    const data: any[] = await res.json();
    if (data.length === 0) break;

    for (const org of data) {
      if (org.users && Array.isArray(org.users)) {
        for (const user of org.users) {
          if (!userMap[user.id]) {
            userMap[user.id] = {
              id: user.id,
              name: user.full_name,
              avatar: user.photo,
              orgs: {} as Record<string, any>,
            };
          }
          userMap[user.id].orgs[org.id] = {
            id: org.id,
            name: org.name,
            logo: org.logo || null,
          };
        }
      }
    }

    allOrgs.push(...data);
    console.log(
      `[hcb] fetched page ${page} (${data.length} orgs, ${allOrgs.length} total)`
    );
    page++;
  }

  const users = Object.values(userMap).map((u: any) => ({
    id: u.id,
    name: u.name,
    avatar: u.avatar,
    orgs: Object.values(u.orgs),
  }));

  return { orgs: allOrgs, users };
}

export async function fetchActivities(
  maxPages: number = 1,
  perPage: number = 15
) {
  const all: any[] = [];
  let page = 1;

  while (page <= maxPages) {
    const res = await fetch(
      `${HCB_BASE}/api/v3/activities?page=${page}&per_page=${perPage}`,
      { headers }
    );
    if (!res.ok) throw new Error(`HCB API error: ${res.status}`);
    const data: any[] = await res.json();
    if (data.length === 0) break;

    all.push(...data);
    console.log(`[hcb] fetched activities page ${page} (${data.length} rows)`);
    if (data.length < perPage) break;
    page++;
  }

  return all;
}

export async function fetchOrg(orgId: string) {
  const res = await fetch(`${HCB_BASE}/api/v3/organizations/${orgId}`, {
    headers,
  });
  if (!res.ok) return null;
  return res.json();
}
