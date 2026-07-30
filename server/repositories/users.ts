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

export interface OrgRoster {
  id: string;
  name: string;
  logo: string | null;
  users: Array<{ id: string; name: string; avatar: string | null }>;
}

export interface ReconcileStats {
  orgsReconciled: number;
  orgsSkipped: number;
  linksAdded: number;
  linksRemoved: number;
}

export async function reconcileOrgMemberships(
  rosters: OrgRoster[]
): Promise<ReconcileStats> {
  const usable = rosters.filter((r) => r.users.length > 0);
  const stats: ReconcileStats = {
    orgsReconciled: usable.length,
    orgsSkipped: rosters.length - usable.length,
    linksAdded: 0,
    linksRemoved: 0,
  };
  if (usable.length === 0) return stats;

  const orgIds: string[] = [];
  const orgNames: string[] = [];
  const orgLogos: (string | null)[] = [];
  const memberOrgIds: string[] = [];
  const memberUserIds: string[] = [];
  const memberNames: string[] = [];
  const memberAvatars: (string | null)[] = [];

  for (const org of usable) {
    orgIds.push(org.id);
    orgNames.push(org.name);
    orgLogos.push(org.logo);
    for (const user of org.users) {
      memberOrgIds.push(org.id);
      memberUserIds.push(user.id);
      memberNames.push(user.name);
      memberAvatars.push(user.avatar);
    }
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // Set-based reconcile over the whole users table; the default 10s cap is
    // tuned for request handlers, not for a full-index sweep.
    await client.query("SET LOCAL statement_timeout = '120s'");

    await client.query(
      `CREATE TEMP TABLE _roster_orgs (
         "id" TEXT PRIMARY KEY, "name" TEXT, "logo" TEXT
       ) ON COMMIT DROP`
    );
    await client.query(
      `CREATE TEMP TABLE _roster_members (
         "org_id" TEXT, "user_id" TEXT, "name" TEXT, "avatar" TEXT
       ) ON COMMIT DROP`
    );

    await client.query(
      `INSERT INTO _roster_orgs ("id", "name", "logo")
       SELECT * FROM unnest($1::text[], $2::text[], $3::text[])
       ON CONFLICT ("id") DO NOTHING`,
      [orgIds, orgNames, orgLogos]
    );
    await client.query(
      `INSERT INTO _roster_members ("org_id", "user_id", "name", "avatar")
       SELECT DISTINCT * FROM unnest($1::text[], $2::text[], $3::text[], $4::text[])`,
      [memberOrgIds, memberUserIds, memberNames, memberAvatars]
    );
    await client.query('CREATE INDEX ON _roster_members ("user_id")');
    await client.query('CREATE INDEX ON _roster_members ("org_id", "user_id")');
    await client.query("ANALYZE _roster_orgs");
    await client.query("ANALYZE _roster_members");

    const diff = await client.query(
      `WITH existing AS (
         SELECT u."id" AS "user_id", e->>'id' AS "org_id"
         FROM "hcb.hackclub.com-users" u
         CROSS JOIN LATERAL jsonb_array_elements(COALESCE(u."orgs", '[]'::jsonb)) e
         WHERE EXISTS (SELECT 1 FROM _roster_orgs o WHERE o."id" = e->>'id')
       )
       SELECT
         (SELECT COUNT(*) FROM existing x
          WHERE NOT EXISTS (
            SELECT 1 FROM _roster_members m
            WHERE m."org_id" = x."org_id" AND m."user_id" = x."user_id"
          ))::int AS "removed",
         (SELECT COUNT(*) FROM _roster_members m
          WHERE NOT EXISTS (
            SELECT 1 FROM existing x
            WHERE x."org_id" = m."org_id" AND x."user_id" = m."user_id"
          ))::int AS "added"`
    );
    stats.linksRemoved = diff.rows[0]?.removed ?? 0;
    stats.linksAdded = diff.rows[0]?.added ?? 0;

    await client.query(
      `WITH affected AS (
         SELECT DISTINCT m."user_id" AS "id" FROM _roster_members m
         UNION
         SELECT u."id"
         FROM "hcb.hackclub.com-users" u
         WHERE EXISTS (
           SELECT 1
           FROM jsonb_array_elements(COALESCE(u."orgs", '[]'::jsonb)) e
           JOIN _roster_orgs o ON o."id" = e->>'id'
         )
       ),
       -- membership in orgs this run did not refresh, preserved as-is
       kept AS (
         SELECT a."id", jsonb_agg(e) AS "entries"
         FROM affected a
         JOIN "hcb.hackclub.com-users" u ON u."id" = a."id"
         CROSS JOIN LATERAL jsonb_array_elements(COALESCE(u."orgs", '[]'::jsonb)) e
         WHERE NOT EXISTS (SELECT 1 FROM _roster_orgs o WHERE o."id" = e->>'id')
         GROUP BY a."id"
       ),
       -- membership as this run observed it, authoritative for the batch
       fresh AS (
         SELECT m."user_id" AS "id",
                jsonb_agg(
                  jsonb_build_object('id', o."id", 'name', o."name", 'logo', o."logo")
                ) AS "entries"
         FROM _roster_members m
         JOIN _roster_orgs o ON o."id" = m."org_id"
         GROUP BY m."user_id"
       ),
       profile AS (
         SELECT m."user_id" AS "id",
                MIN(m."name") AS "name",
                MIN(m."avatar") AS "avatar"
         FROM _roster_members m
         GROUP BY m."user_id"
       )
       INSERT INTO "hcb.hackclub.com-users" ("id", "name", "avatar", "orgs")
       SELECT a."id",
              COALESCE(p."name", u."name"),
              COALESCE(p."avatar", u."avatar"),
              COALESCE(k."entries", '[]'::jsonb) || COALESCE(f."entries", '[]'::jsonb)
       FROM affected a
       LEFT JOIN "hcb.hackclub.com-users" u ON u."id" = a."id"
       LEFT JOIN kept k ON k."id" = a."id"
       LEFT JOIN fresh f ON f."id" = a."id"
       LEFT JOIN profile p ON p."id" = a."id"
       ON CONFLICT ("id") DO UPDATE SET
         "name" = EXCLUDED."name",
         "avatar" = EXCLUDED."avatar",
         "orgs" = EXCLUDED."orgs"`
    );

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  return stats;
}
