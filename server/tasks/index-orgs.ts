import { fetchAllOrgs } from "../utils/hcb";
import {
  bulkUpsertOrgs,
  getExistingOrgIds,
  getUnfrozenOrgIds,
} from "../repositories/orgs";
import { bulkUpsertUsers } from "../repositories/users";
import { notifyNewOrg, notifyOrgFrozen } from "../utils/slack";

export default defineTask({
  meta: {
    name: "index-orgs",
    description: "Index all organizations and users from the HCB API",
  },
  async run() {
    console.log("[index-orgs] starting...");

    const { orgs, users } = await fetchAllOrgs();
    console.log(
      `[index-orgs] fetched ${orgs.length} orgs, ${users.length} users`
    );

    const formatted = orgs.map((org: any) => ({
      id: org.id,
      name: org.name,
      slug: org.slug,
      logo: org.logo || null,
      category: org.category || null,
      balance: org.balances?.balance_cents || 0,
      financially_frozen: org.financially_frozen || false,
    }));

    const existingIds = await getExistingOrgIds(formatted.map((o) => o.id));
    const newOrgs = formatted.filter((o) => !existingIds.has(o.id));

    const frozenFromApi = formatted.filter((o) => o.financially_frozen);
    const previouslyUnfrozen = await getUnfrozenOrgIds(
      frozenFromApi.map((o) => o.id)
    );
    const newlyFrozen = frozenFromApi.filter((o) =>
      previouslyUnfrozen.has(o.id)
    );

    await bulkUpsertOrgs(formatted);
    console.log(`[index-orgs] upserted ${formatted.length} orgs`);

    await bulkUpsertUsers(users);
    console.log(`[index-orgs] upserted ${users.length} users`);

    if (newOrgs.length > 0) {
      console.log(`[index-orgs] ${newOrgs.length} new orgs, notifying slack`);
      for (const org of newOrgs) {
        await notifyNewOrg(org);
      }
    }

    if (newlyFrozen.length > 0) {
      console.log(
        `[index-orgs] ${newlyFrozen.length} orgs newly frozen, notifying the nerds`
      );
      for (const org of newlyFrozen) {
        await notifyOrgFrozen(org);
      }
    }

    await runTask("index-past-orgs");

    console.log("[index-orgs] done");
    return { result: `Indexed ${orgs.length} orgs, ${users.length} users` };
  },
});
