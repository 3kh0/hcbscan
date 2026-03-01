import { query, pool } from "../utils/db";

export async function isOrgIndexed(id: string) {
  const result = await query(
    'SELECT 1 FROM "hcb.hackclub.com" WHERE "Organization ID" = $1',
    [id]
  );
  return result.rows.length > 0;
}

export async function getOrgFrozenAt(id: string) {
  const result = await query(
    'SELECT "Frozen At" FROM "hcb.hackclub.com" WHERE "Organization ID" = $1',
    [id]
  );
  return result.rows[0]?.["Frozen At"] || null;
}

export async function upsertOrg(org: {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  balance: number;
  financially_frozen?: boolean;
}) {
  const now = new Date().toISOString();
  const frozenAt = org.financially_frozen ? now : null;
  await query(
    `INSERT INTO "hcb.hackclub.com" ("Organization ID", "Name", "Slug", "Category", "Balance", "Added", "Frozen At")
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT ("Organization ID")
     DO UPDATE SET "Name" = $2, "Slug" = $3, "Category" = $4, "Balance" = $5, "Added" = $6,
       "Frozen At" = CASE
         WHEN $7::timestamptz IS NOT NULL AND "hcb.hackclub.com"."Frozen At" IS NULL THEN $7::timestamptz
         WHEN $7::timestamptz IS NULL THEN NULL
         ELSE "hcb.hackclub.com"."Frozen At"
       END`,
    [org.id, org.name, org.slug, org.category, org.balance, now, frozenAt]
  );
}

export async function bulkUpsertOrgs(
  orgs: Array<{
    id: string;
    name: string;
    slug: string;
    category: string | null;
    balance: number;
    financially_frozen?: boolean;
  }>
) {
  const now = new Date().toISOString();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const org of orgs) {
      const frozenAt = org.financially_frozen ? now : null;
      await client.query(
        `INSERT INTO "hcb.hackclub.com" ("Organization ID", "Name", "Slug", "Category", "Balance", "Added", "Frozen At")
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT ("Organization ID") DO UPDATE SET
           "Name" = $2, "Slug" = $3, "Category" = $4, "Balance" = $5,
           "Added" = $6,
           "Frozen At" = CASE
             WHEN $7::timestamptz IS NOT NULL AND "hcb.hackclub.com"."Frozen At" IS NULL THEN $7::timestamptz
             WHEN $7::timestamptz IS NULL THEN NULL
             ELSE "hcb.hackclub.com"."Frozen At"
           END`,
        [org.id, org.name, org.slug, org.category, org.balance, now, frozenAt]
      );
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function getOrgsNeedingRefresh() {
  const result = await query(
    `SELECT "Organization ID" FROM "hcb.hackclub.com"
     WHERE "Added" IS NULL OR "Added" < NOW() - INTERVAL '30 minutes'`
  );
  return result.rows as Array<{ "Organization ID": string }>;
}
