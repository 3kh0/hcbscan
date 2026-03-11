import {
  getOrgCount,
  getSumBalance,
  getVolume7d,
  getVolumePrevious,
  getTopOrgsByBalance,
  getMostActiveOrgs,
  getMostActiveUsers,
  getActivityVolume30d,
} from "../../../repositories/stats";
import { wrapOk } from "../../../utils/api-envelope";

export default defineEventHandler(async (event) => {
  setHeader(event, "Cache-Control", "public, max-age=60, s-maxage=60");

  const [
    orgCount,
    sumBalance,
    volume7d,
    volumePrevious,
    topOrgs,
    mostActiveOrgs,
    mostActiveUsers,
    activityVolume,
  ] = await Promise.all([
    getOrgCount(),
    getSumBalance(),
    getVolume7d(),
    getVolumePrevious(),
    getTopOrgsByBalance(10),
    getMostActiveOrgs(10),
    getMostActiveUsers(10),
    getActivityVolume30d(),
  ]);

  return wrapOk({
    total_organizations: orgCount,
    total_balance_cents: Number(sumBalance),
    activity_volume_7d: volume7d,
    activity_volume_previous_7d: volumePrevious,
    top_orgs_by_balance: topOrgs.map((org, i) => ({
      rank: i + 1,
      id: org["Organization ID"],
      name: org["Name"],
      slug: org["Slug"],
      category: org["Category"],
      balance_cents: parseInt(org["Balance"], 10),
    })),
    most_active_orgs_7d: mostActiveOrgs.map((org, i) => ({
      rank: i + 1,
      id: org["Organization ID"],
      name: org["Organization Name"],
      activity_count: parseInt(org.activity_count, 10),
    })),
    most_active_users_7d: mostActiveUsers.map((user, i) => ({
      rank: i + 1,
      id: user["User ID"],
      name: user["User Name"],
      avatar: user["User Photo"],
      activity_count: parseInt(user.activity_count, 10),
    })),
    activity_volume_30d: activityVolume.map((row) => ({
      date: row.day,
      count: parseInt(row.count, 10),
    })),
  });
});
