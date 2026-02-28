import { fetchAllOrgs } from "../utils/hcb";
import { bulkUpsertUsers } from "../repositories/users";

export default defineTask({
  meta: {
    name: "index-users",
    description:
      "Re-index users from the HCB API (fetches orgs to extract user data)",
  },
  async run() {
    console.log("[index-users] starting...");

    const { users } = await fetchAllOrgs();
    console.log(`[index-users] fetched ${users.length} users`);

    await bulkUpsertUsers(users);
    console.log(`[index-users] upserted ${users.length} users`);

    console.log("[index-users] done");
    return { result: `Indexed ${users.length} users` };
  },
});
