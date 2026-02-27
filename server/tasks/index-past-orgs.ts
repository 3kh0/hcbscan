import { fetchOrg } from "../utils/hcb";
import { getOrgsNeedingRefresh } from "../repositories/orgs";
import { query } from "../utils/db";

export default defineTask({
  meta: {
    name: "index-past-orgs",
    description:
      "Refresh organizations with null or stale Added timestamps from the HCB API",
  },
  async run() {
    console.log("[index-past-orgs] starting...");

    const stale = await getOrgsNeedingRefresh();
    console.log(`[index-past-orgs] found ${stale.length} orgs needing refresh`);

    if (stale.length === 0) {
      console.log("[index-past-orgs] nothing to update");
      return { result: "No orgs needed refresh" };
    }

    let updated = 0;
    for (const row of stale) {
      const orgId = row["Organization ID"];
      const orgData = await fetchOrg(orgId);
      if (!orgData) {
        console.error(`[index-past-orgs] failed to fetch org ${orgId}`);
        continue;
      }

      const now = new Date().toISOString();
      await query(
        `INSERT INTO "hcb.hackclub.com" ("Organization ID", "Name", "Slug", "Category", "Balance", "Added")
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT ("Organization ID") DO UPDATE SET
           "Name" = $2, "Slug" = $3, "Category" = $4, "Balance" = $5, "Added" = $6`,
        [
          orgData.id,
          orgData.name,
          orgData.slug,
          orgData.category || null,
          orgData.balances?.balance_cents || 0,
          now,
        ]
      );
      updated++;
    }

    console.log(`[index-past-orgs] refreshed ${updated} orgs`);
    return { result: `Refreshed ${updated} orgs` };
  },
});
