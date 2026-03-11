import { query } from "../../../utils/db";
import { wrapOk, parsePagination, mapOrg, paginationMeta } from "../../../utils/api-envelope";

export default defineEventHandler(async (event) => {
  setHeader(event, "Cache-Control", "public, max-age=300, s-maxage=300");

  const { page, per_page, offset } = parsePagination(event);
  const p = getQuery(event);
  const order = String(p.order || "desc").toLowerCase() === "asc" ? "ASC" : "DESC";
  const category = p.category ? String(p.category) : null;

  const sortCol: Record<string, string> = { balance: '"Balance"', name: '"Name"', added: '"Added"' };
  const col = sortCol[String(p.sort || "balance")] || '"Balance"';

  const conds: string[] = [];
  const vals: unknown[] = [];
  let idx = 1;
  if (category) { conds.push(`"Category" = $${idx++}`); vals.push(category); }

  const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";

  const [cnt, data] = await Promise.all([
    query(`SELECT COUNT(*) FROM "hcb.hackclub.com" ${where}`, vals),
    query(
      `SELECT "Organization ID", "Name", "Slug", "Category", "Balance", "Added", "Frozen At"
       FROM "hcb.hackclub.com" ${where}
       ORDER BY ${col} ${order} NULLS LAST
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...vals, per_page, offset]
    ),
  ]);

  const total = parseInt(cnt.rows[0].count, 10);
  return wrapOk(data.rows.map(mapOrg), paginationMeta(page, per_page, total));
});
