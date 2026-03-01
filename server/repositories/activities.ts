import { query, pool } from "../utils/db";

export async function getActivities(limit: number, offset: number = 0) {
  const result = await query(
    `SELECT * FROM "hcb.hackclub.com-acts"
     ORDER BY "Created At" DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return result.rows;
}

export async function getActivitiesByUserId(
  userId: string,
  limit: number = 50,
  offset: number = 0
) {
  const result = await query(
    `SELECT * FROM "hcb.hackclub.com-acts"
     WHERE "User ID" = $1
     ORDER BY "Created At" DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  return result.rows;
}

export async function getExistingActivityIds(
  ids: string[]
): Promise<Set<string>> {
  if (ids.length === 0) return new Set();
  const placeholders = ids.map((_, i) => `$${i + 1}`).join(", ");
  const result = await query(
    `SELECT "Activity ID" FROM "hcb.hackclub.com-acts" WHERE "Activity ID" IN (${placeholders})`,
    ids
  );
  return new Set(result.rows.map((r: any) => r["Activity ID"]));
}

export async function bulkUpsertActivities(
  activities: Array<{
    id: string;
    key: string;
    created_at: string;
    user: { id: string; full_name: string; photo: string } | null;
    organization: {
      id: string;
      name: string;
      logo: string | null;
    } | null;
  }>
) {
  const now = new Date().toISOString();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const act of activities) {
      await client.query(
        `INSERT INTO "hcb.hackclub.com-acts"
         ("Activity ID", "Key", "Created At", "User ID", "User Name", "User Photo",
          "Organization ID", "Organization Name", "Organization Logo", "Last Updated")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT ("Activity ID") DO UPDATE SET
           "Key" = $2, "Created At" = $3, "User ID" = $4, "User Name" = $5, "User Photo" = $6,
           "Organization ID" = $7, "Organization Name" = $8, "Organization Logo" = $9, "Last Updated" = $10`,
        [
          act.id,
          act.key,
          act.created_at,
          act.user?.id || null,
          act.user?.full_name || null,
          act.user?.photo || null,
          act.organization?.id || null,
          act.organization?.name || null,
          act.organization?.logo || null,
          now,
        ]
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
