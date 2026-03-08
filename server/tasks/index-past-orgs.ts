import { fetchOrg } from "../utils/hcb";
import { getOrgsNeedingRefresh, bulkUpsertOrgs } from "../repositories/orgs";

const MAX_ORGS_PER_RUN = 50;
const BATCH_SIZE = 5;
const BATCH_DELAY_MS = 1000;

export default defineTask({
  meta: {
    name: "index-past-orgs",
    description:
      "Refresh the most stale organizations from the HCB API, oldest first",
  },
  async run() {
    console.log("[index-past-orgs] starting...");

    const stale = await getOrgsNeedingRefresh(MAX_ORGS_PER_RUN);
    if (stale.length === 0) {
      console.log("[index-past-orgs] all orgs are up to date");
      return { result: "All orgs up to date" };
    }

    console.log(`[index-past-orgs] refreshing ${stale.length} most stale orgs`);

    let totalUpdated = 0;

    for (let i = 0; i < stale.length; i += BATCH_SIZE) {
      const batch = stale.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(
        batch.map((row) => fetchOrg(row["Organization ID"]))
      );

      const orgs = results
        .filter((org) => org !== null)
        .map((org) => ({
          id: org.id,
          name: org.name,
          slug: org.slug,
          category: org.category || null,
          balance: org.balances?.balance_cents || 0,
          financially_frozen: org.financially_frozen || false,
        }));

      if (orgs.length > 0) {
        await bulkUpsertOrgs(orgs);
        totalUpdated += orgs.length;
      }

      if (i + BATCH_SIZE < stale.length) {
        await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
      }
    }

    console.log(`[index-past-orgs] refreshed ${totalUpdated} orgs`);
    return { result: `Refreshed ${totalUpdated} orgs` };
  },
});
