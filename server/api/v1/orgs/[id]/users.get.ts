import { query } from "../../../../utils/db";
import { wrapOk, wrapError } from "../../../../utils/api-envelope";

export default defineEventHandler(async (event) => {
  setHeader(event, "Cache-Control", "public, max-age=300, s-maxage=300");

  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, data: wrapError("BAD_REQUEST", "Organization ID is required") });

  const r = await query(
    `SELECT "id", "name", "avatar" FROM "hcb.hackclub.com-users" WHERE "orgs" @> $1::jsonb`,
    [JSON.stringify([{ id }])]
  );

  return wrapOk(r.rows.map((u: any) => ({ id: u.id, name: u.name, avatar: u.avatar })));
});
