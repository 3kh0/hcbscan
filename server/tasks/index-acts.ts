import { fetchActivities } from "../utils/hcb";
import { bulkUpsertActivities } from "../repositories/activities";

export default defineTask({
  meta: {
    name: "index-acts",
    description: "Index recent activities from the HCB API",
  },
  async run() {
    console.log("[index-acts] starting...");

    const activities = await fetchActivities(1, 15);

    // dedupe??
    const seen = new Map<string, any>();
    for (const act of activities) {
      seen.set(act.id, act);
    }
    const unique = Array.from(seen.values());
    console.log(
      `[index-acts] fetched ${activities.length} rows, ${unique.length} unique`
    );

    await bulkUpsertActivities(unique);
    console.log(`[index-acts] upserted ${unique.length} activities`);

    console.log("[index-acts] done");
    return { result: `Indexed ${unique.length} activities` };
  },
});
