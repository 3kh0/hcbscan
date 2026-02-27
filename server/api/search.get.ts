import { searchOrgs, searchUsers } from "../repositories/search";

export default defineEventHandler(async (event) => {
  const params = getQuery(event);
  const q = String(params.q || "").trim();
  const scope = String(params.scope || "all");
  const limit = Math.min(Math.max(parseInt(String(params.limit || "15"), 10) || 15, 1), 50);

  if (!q) {
    return { orgs: [], users: [] };
  }

  const [orgs, users] = await Promise.all([
    scope === "users" ? [] : searchOrgs(q, limit),
    scope === "orgs" ? [] : searchUsers(q, limit),
  ]);

  return { orgs, users };
});
