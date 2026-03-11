import { query } from "../../../../utils/db";
import {
  wrapOk,
  wrapError,
  parsePagination,
  mapActivity,
  paginationMeta,
} from "../../../../utils/api-envelope";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id)
    throw createError({
      statusCode: 400,
      data: wrapError("BAD_REQUEST", "Organization ID is required"),
    });

  const { page, per_page, offset } = parsePagination(event);

  const [cnt, data] = await Promise.all([
    query(
      `SELECT COUNT(*) FROM "hcb.hackclub.com-acts" WHERE "Organization ID" = $1`,
      [id]
    ),
    query(
      `SELECT * FROM "hcb.hackclub.com-acts"
       WHERE "Organization ID" = $1
       ORDER BY "Created At" DESC
       LIMIT $2 OFFSET $3`,
      [id, per_page, offset]
    ),
  ]);

  const total = parseInt(cnt.rows[0].count, 10);
  return wrapOk(
    data.rows.map(mapActivity),
    paginationMeta(page, per_page, total)
  );
});
