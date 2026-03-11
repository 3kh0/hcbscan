import { searchOrgs, searchUsers, searchActivities } from "../../repositories/search";
import { wrapOk, wrapError } from "../../utils/api-envelope";

export default defineEventHandler(async (event) => {
  const p = getQuery(event);
  const q = String(p.q || "").trim();
  const scope = String(p.scope || "all");
  const limit = Math.min(Math.max(parseInt(String(p.limit || "15"), 10) || 15, 1), 50);

  if (!q) throw createError({ statusCode: 400, data: wrapError("BAD_REQUEST", "Query parameter 'q' is required") });

  const [orgs, users, acts] = await Promise.all([
    scope === "users" || scope === "activities" ? [] : searchOrgs(q, limit),
    scope === "orgs" || scope === "activities" ? [] : searchUsers(q, limit),
    scope === "orgs" || scope === "users" ? [] : searchActivities(q, limit),
  ]);

  return wrapOk({
    orgs: orgs.map((r: any) => ({
      id: r["Organization ID"],
      name: r["Name"],
      slug: r["Slug"],
      category: r["Category"],
      balance_cents: Number(r["Balance"]),
    })),
    users: users.map((r: any) => ({ id: r.id, name: r.name, avatar: r.avatar })),
    activities: acts.map((r: any) => ({
      id: r["Activity ID"],
      key: r["Key"],
      created_at: r["Created At"],
      user: r["User ID"] ? { id: r["User ID"], name: r["User Name"] } : null,
      organization: r["Organization ID"] ? { id: r["Organization ID"], name: r["Organization Name"] } : null,
    })),
  });
});
