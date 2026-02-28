import { query, pool } from "../utils/db";

export async function getUserById(id: string) {
  const result = await query(
    'SELECT * FROM "hcb.hackclub.com-users" WHERE "id" = $1',
    [id]
  );
  return result.rows[0] ?? null;
}

export async function getUserNetWorth(id: string): Promise<number> {
  const result = await query(
    `SELECT COALESCE(SUM(o."Balance"), 0) AS "netWorth"
     FROM "hcb.hackclub.com" o
     WHERE o."Organization ID" IN (
       SELECT elem->>'id'
       FROM "hcb.hackclub.com-users" u,
            jsonb_array_elements(u."orgs") AS elem
       WHERE u."id" = $1
     )`,
    [id]
  );
  return parseInt(result.rows[0]?.netWorth ?? "0", 10);
}

export async function bulkUpsertUsers(
  users: Array<{
    id: string;
    name: string;
    avatar: string | null;
    orgs: any[];
  }>
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const user of users) {
      await client.query(
        `INSERT INTO "hcb.hackclub.com-users" ("id", "name", "avatar", "orgs")
         VALUES ($1, $2, $3, $4)
         ON CONFLICT ("id") DO UPDATE SET
           "name" = $2, "avatar" = $3, "orgs" = $4`,
        [user.id, user.name, user.avatar, JSON.stringify(user.orgs)]
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
