import { query } from "../utils/db";

export async function isOrgIndexed(id: string) {
  const result = await query(
    'SELECT 1 FROM "hcb.hackclub.com" WHERE "Organization ID" = $1',
    [id]
  );
  return result.rows.length > 0;
}

export async function upsertOrg(org: {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  balance: number;
}) {
  const now = new Date().toISOString();
  await query(
    `INSERT INTO "hcb.hackclub.com" ("Organization ID", "Name", "Slug", "Category", "Balance", "Added")
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT ("Organization ID")
     DO UPDATE SET "Name" = $2, "Slug" = $3, "Category" = $4, "Balance" = $5, "Added" = $6`,
    [org.id, org.name, org.slug, org.category, org.balance, now]
  );
}
