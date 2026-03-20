import { query, pool } from "../utils/db";

export async function getUserById(id: string) {
  const result = await query(
    'SELECT * FROM "hcb.hackclub.com-users" WHERE "id" = $1',
    [id]
  );
  return result.rows[0] ?? null;
}

export async function getUserWithBalances(id: string) {
  const result = await query(
    `SELECT u.*,
            COALESCE(b.balances, '{}'::jsonb) AS "orgBalances",
            COALESCE(ac.cnt, 0) AS "activityCount"
     FROM "hcb.hackclub.com-users" u
     LEFT JOIN LATERAL (
       SELECT jsonb_object_agg(o."Organization ID", o."Balance") AS balances
       FROM "hcb.hackclub.com" o
       WHERE o."Organization ID" IN (
         SELECT elem->>'id' FROM jsonb_array_elements(u."orgs") AS elem
       )
     ) b ON true
     LEFT JOIN LATERAL (
       SELECT COUNT(*)::int AS cnt
       FROM "hcb.hackclub.com-acts" a
       WHERE a."User ID" = u."id"
     ) ac ON true
     WHERE u."id" = $1`,
    [id]
  );
  return result.rows[0] ?? null;
}

export async function upsertUsersForOrg(
  orgId: string,
  orgName: string,
  orgLogo: string | null,
  users: Array<{ id: string; name: string; avatar: string | null }>
) {
  const orgEntry = JSON.stringify({ id: orgId, name: orgName, logo: orgLogo });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const user of users) {
      await client.query(
        `INSERT INTO "hcb.hackclub.com-users" ("id", "name", "avatar", "orgs")
         VALUES ($1, $2, $3, jsonb_build_array($4::jsonb))
         ON CONFLICT ("id") DO UPDATE SET
           "name" = $2,
           "avatar" = $3,
           "orgs" = (
             SELECT jsonb_agg(elem)
             FROM (
               SELECT elem FROM jsonb_array_elements("hcb.hackclub.com-users"."orgs") AS elem
               WHERE elem->>'id' != $5
               UNION ALL
               SELECT $4::jsonb
             ) sub
           )`,
        [user.id, user.name, user.avatar, orgEntry, orgId]
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
