import { fetchActivities } from "../utils/hcb";
import {
  bulkUpsertActivities,
  getExistingActivityIds,
} from "../repositories/activities";
import { notifyNewActivity } from "../utils/slack";

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

    const existingIds = await getExistingActivityIds(unique.map((a) => a.id));
    const newActivities = unique.filter((a) => !existingIds.has(a.id));

    await bulkUpsertActivities(unique);
    console.log(`[index-acts] upserted ${unique.length} activities`);

    if (newActivities.length > 0) {
      console.log(
        `[index-acts] ${newActivities.length} new activities, notifying slack`
      );
      for (const act of newActivities) {
        await notifyNewActivity(act);
      }
    }

    console.log("[index-acts] done");
    return { result: `Indexed ${unique.length} activities` };
  },
});
