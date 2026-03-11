import { query } from "../../../utils/db";
import { wrapOk, wrapError, mapOrg } from "../../../utils/api-envelope";

export default defineEventHandler(async (event) => {
  setHeader(event, "Cache-Control", "public, max-age=300, s-maxage=300");

  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, data: wrapError("BAD_REQUEST", "Organization ID is required") });

  const r = await query(
    `SELECT "Organization ID", "Name", "Slug", "Category", "Balance", "Added", "Frozen At"
     FROM "hcb.hackclub.com"
     WHERE "Organization ID" = $1`,
    [id]
  );

  if (r.rows.length === 0) throw createError({ statusCode: 404, data: wrapError("NOT_FOUND", "Organization not found") });

  return wrapOk(mapOrg(r.rows[0]));
});
