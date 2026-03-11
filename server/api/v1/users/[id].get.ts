import { getUserWithBalances } from "../../../repositories/users";
import { wrapOk, wrapError } from "../../../utils/api-envelope";

export default defineEventHandler(async (event) => {
  setHeader(event, "Cache-Control", "public, max-age=300, s-maxage=300");

  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, data: wrapError("BAD_REQUEST", "User ID is required") });

  const u = await getUserWithBalances(id);
  if (!u) throw createError({ statusCode: 404, data: wrapError("NOT_FOUND", "User not found") });

  const bals: Record<string, number> = u.orgBalances || {};
  const orgs = (u.orgs || []).map((o: any) => ({
    id: o.id,
    name: o.name,
    logo: o.logo || null,
    balance_cents: bals[o.id] != null ? Number(bals[o.id]) : null,
  }));

  return wrapOk({
    id: u.id,
    name: u.name,
    avatar: u.avatar,
    organizations: orgs,
    net_worth_cents: Object.values(bals).reduce((s: number, b) => s + (Number(b) || 0), 0),
    activity_count: Number(u.activityCount) || 0,
  });
});
