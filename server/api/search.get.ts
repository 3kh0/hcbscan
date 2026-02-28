import {
  searchOrgs,
  searchUsers,
  searchActivities,
} from "../repositories/search";

export default defineEventHandler(async (event) => {
  const params = getQuery(event);
  const q = String(params.q || "").trim();
  const scope = String(params.scope || "all");
  const limit = Math.min(
    Math.max(parseInt(String(params.limit || "15"), 10) || 15, 1),
    50
  );

  if (!q) {
    return { orgs: [], users: [], activities: [] };
  }

  const [orgs, users, activities] = await Promise.all([
    scope === "users" || scope === "activities" ? [] : searchOrgs(q, limit),
    scope === "orgs" || scope === "activities" ? [] : searchUsers(q, limit),
    scope === "orgs" || scope === "users" ? [] : searchActivities(q, limit),
  ]);

  return { orgs, users, activities };
});
