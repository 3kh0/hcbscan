import {
  getOrgCount,
  getSumBalance,
  getVolume7d,
  getVolumePrevious,
  getTopOrgsByBalance,
  getMostActiveOrgs,
  getMostActiveUsers,
  getActivityVolume30d,
} from "../../repositories/stats";

export default defineEventHandler(async () => {
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

  return {
    accounts: orgCount,
    balance: sumBalance,
    volume7d,
    volumePrevious,
    topOrgs: topOrgs.map((org, i) => ({
      rank: i + 1,
      id: org["Organization ID"],
      name: org["Name"],
      slug: org["Slug"],
      category: org["Category"],
      balance: parseInt(org["Balance"], 10),
    })),
    mostActiveOrgs: mostActiveOrgs.map((org, i) => ({
      rank: i + 1,
      id: org["Organization ID"],
      name: org["Organization Name"],
      activityCount: parseInt(org.activity_count, 10),
    })),
    mostActiveUsers: mostActiveUsers.map((user, i) => ({
      rank: i + 1,
      id: user["User ID"],
      name: user["User Name"],
      photo: user["User Photo"],
      activityCount: parseInt(user.activity_count, 10),
    })),
    activityVolume: activityVolume.map((row) => ({
      day: row.day,
      count: parseInt(row.count, 10),
    })),
  };
});
