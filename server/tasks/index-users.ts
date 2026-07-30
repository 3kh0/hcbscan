import { fetchAllOrgs, toOrgRosters } from "../utils/hcb";
import { reconcileOrgMemberships } from "../repositories/users";

export default defineTask({
  meta: {
    name: "index-users",
    description:
      "Re-index users from the HCB API (fetches orgs to extract user data)",
  },
  async run() {
    console.log("[index-users] starting...");

    const { orgs } = await fetchAllOrgs();
    const rosters = toOrgRosters(orgs);
    console.log(
      `[index-users] fetched ${rosters.reduce((n, r) => n + r.users.length, 0)} memberships across ${orgs.length} orgs`
    );

    const membership = await reconcileOrgMemberships(rosters);
    console.log(
      `[index-users] reconciled ${membership.orgsReconciled} org rosters ` +
        `(+${membership.linksAdded}/-${membership.linksRemoved} memberships, ` +
        `${membership.orgsSkipped} orgs had no roster)`
    );

    console.log("[index-users] done");
    return {
      result: `Reconciled ${membership.orgsReconciled} rosters (+${membership.linksAdded}/-${membership.linksRemoved})`,
    };
  },
});
