import { query } from "../../utils/db";
import {
  wrapOk,
  parsePagination,
  mapActivity,
  paginationMeta,
} from "../../utils/api-envelope";

export default defineEventHandler(async (event) => {
  const { page, per_page, offset } = parsePagination(event);
  const p = getQuery(event);

  const conds: string[] = [];
  const vals: unknown[] = [];
  let idx = 1;

  if (p.org_id) {
    conds.push(`"Organization ID" = $${idx++}`);
    vals.push(String(p.org_id));
  }
  if (p.user_id) {
    conds.push(`"User ID" = $${idx++}`);
    vals.push(String(p.user_id));
  }
  if (p.key) {
    conds.push(`"Key" = $${idx++}`);
    vals.push(String(p.key));
  }
  if (p.after) {
    conds.push(`"Created At" >= $${idx++}`);
    vals.push(String(p.after));
  }
  if (p.before) {
    conds.push(`"Created At" <= $${idx++}`);
    vals.push(String(p.before));
  }

  const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";

  const [cnt, data] = await Promise.all([
    query(`SELECT COUNT(*) FROM "hcb.hackclub.com-acts" ${where}`, vals),
    query(
      `SELECT * FROM "hcb.hackclub.com-acts" ${where}
       ORDER BY "Created At" DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...vals, per_page, offset]
    ),
  ]);

  const total = parseInt(cnt.rows[0].count, 10);
  return wrapOk(
    data.rows.map(mapActivity),
    paginationMeta(page, per_page, total)
  );
});
