import { fetchOrg } from "../utils/hcb";
import { getOrgsNeedingRefresh, bulkUpsertOrgs } from "../repositories/orgs";

const BATCH_SIZE = 10;

export default defineTask({
  meta: {
    name: "index-past-orgs",
    description:
      "Refresh organizations with null or stale Added timestamps from the HCB API",
  },
  async run() {
    console.log("[index-past-orgs] starting...");

    let totalUpdated = 0;

    while (true) {
      const stale = await getOrgsNeedingRefresh();
      if (stale.length === 0) break;

      console.log(`[index-past-orgs] ${stale.length} orgs still need refresh`);

      const batch = stale.slice(0, BATCH_SIZE);
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
        }));

      if (orgs.length > 0) {
        await bulkUpsertOrgs(orgs);
        totalUpdated += orgs.length;
        console.log(`[index-past-orgs] upserted batch of ${orgs.length}`);
      }
    }

    console.log(`[index-past-orgs] refreshed ${totalUpdated} orgs total`);
    return { result: `Refreshed ${totalUpdated} orgs` };
  },
});
