import { query } from "../utils/db";

const count = async (sql: string, params?: unknown[]) => {
  const r = await query(sql, params);
  return parseInt(r.rows[0].count, 10);
};

export const getOrgCount = () =>
  count('SELECT COUNT(*) FROM "hcb.hackclub.com"');

export const getSumBalance = async () => {
  const r = await query('SELECT SUM("Balance") FROM "hcb.hackclub.com"');
  return r.rows[0].sum ?? 0;
};

export const getVolume7d = () =>
  count(
    `SELECT COUNT(*) FROM "hcb.hackclub.com-acts" WHERE "Created At" >= NOW() - INTERVAL '7 days'`
  );

export const getVolumePrevious = () =>
  count(
    `SELECT COUNT(*) FROM "hcb.hackclub.com-acts" WHERE "Created At" >= NOW() - INTERVAL '14 days' AND "Created At" < NOW() - INTERVAL '7 days'`
  );


export async function getTopOrgsByBalance(limit = 10) {
  const r = await query(
    `SELECT "Organization ID", "Name", "Slug", "Category", "Balance"
     FROM "hcb.hackclub.com"
     WHERE "Balance" IS NOT NULL
     ORDER BY "Balance" DESC
     LIMIT $1`,
    [limit]
  );
  return r.rows as Array<{
    "Organization ID": string;
    Name: string;
    Slug: string;
    Category: string | null;
    Balance: string;
  }>;
}

export async function getMostActiveOrgs(limit = 10) {
  const r = await query(
    `SELECT "Organization ID", "Organization Name", COUNT(*) as activity_count
     FROM "hcb.hackclub.com-acts"
     WHERE "Created At" >= NOW() - INTERVAL '7 days'
       AND "Organization ID" IS NOT NULL
     GROUP BY "Organization ID", "Organization Name"
     ORDER BY activity_count DESC
     LIMIT $1`,
    [limit]
  );
  return r.rows as Array<{
    "Organization ID": string;
    "Organization Name": string;
    activity_count: string;
  }>;
}

export async function getMostActiveUsers(limit = 10) {
  const r = await query(
    `SELECT "User ID", "User Name", "User Photo", COUNT(*) as activity_count
     FROM "hcb.hackclub.com-acts"
     WHERE "Created At" >= NOW() - INTERVAL '7 days'
       AND "User ID" IS NOT NULL
     GROUP BY "User ID", "User Name", "User Photo"
     ORDER BY activity_count DESC
     LIMIT $1`,
    [limit]
  );
  return r.rows as Array<{
    "User ID": string;
    "User Name": string;
    "User Photo": string | null;
    activity_count: string;
  }>;
}

export async function getActivityVolume30d() {
  const r = await query(
    `SELECT DATE("Created At") as day, COUNT(*) as count
     FROM "hcb.hackclub.com-acts"
     WHERE "Created At" >= NOW() - INTERVAL '30 days'
     GROUP BY day
     ORDER BY day`
  );
  return r.rows as Array<{ day: string; count: string }>;
}
