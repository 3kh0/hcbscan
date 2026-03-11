import { query } from "../../utils/db";
import { wrapOk, wrapError } from "../../utils/api-envelope";

export default defineEventHandler(async (event) => {
  setHeader(event, "Cache-Control", "public, max-age=60, s-maxage=60");

  const p = getQuery(event);
  const type = String(p.type || "balance");
  const limit = Math.min(
    Math.max(parseInt(String(p.limit || "10"), 10) || 10, 1),
    50
  );

  if (type === "balance") {
    const r = await query(
      `SELECT "Organization ID", "Name", "Slug", "Category", "Balance"
       FROM "hcb.hackclub.com"
       WHERE "Balance" IS NOT NULL
       ORDER BY "Balance" DESC LIMIT $1`,
      [limit]
    );
    return wrapOk(
      r.rows.map((o: any, i: number) => ({
        rank: i + 1,
        id: o["Organization ID"],
        name: o["Name"],
        slug: o["Slug"],
        category: o["Category"],
        balance_cents: Number(o["Balance"]),
      }))
    );
  }

  if (type === "active_orgs" || type === "active_users") {
    const interval = String(p.period || "7d") === "30d" ? "30 days" : "7 days";
    const period = String(p.period || "7d");
    const isOrgs = type === "active_orgs";

    const groupCol = isOrgs
      ? '"Organization ID", "Organization Name"'
      : '"User ID", "User Name", "User Photo"';
    const filterCol = isOrgs ? '"Organization ID"' : '"User ID"';

    const r = await query(
      `SELECT ${groupCol}, COUNT(*) as activity_count
       FROM "hcb.hackclub.com-acts"
       WHERE "Created At" >= NOW() - $1::interval AND ${filterCol} IS NOT NULL
       GROUP BY ${groupCol}
       ORDER BY activity_count DESC LIMIT $2`,
      [interval, limit]
    );

    return wrapOk(
      r.rows.map((row: any, i: number) => ({
        rank: i + 1,
        id: row[isOrgs ? "Organization ID" : "User ID"],
        name: row[isOrgs ? "Organization Name" : "User Name"],
        ...(isOrgs ? {} : { avatar: row["User Photo"] }),
        activity_count: parseInt(row.activity_count, 10),
        period,
      }))
    );
  }

  throw createError({
    statusCode: 400,
    data: wrapError(
      "BAD_REQUEST",
      "Invalid type. Must be one of: balance, active_orgs, active_users"
    ),
  });
});
