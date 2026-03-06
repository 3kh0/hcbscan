import { getUserWithBalances } from "../../repositories/users";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "User ID is required",
    });
  }

  const user = await getUserWithBalances(id);
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  const orgBalances: Record<string, number> = user.orgBalances || {};

  const orgs = (user.orgs || []).map((org: any) => ({
    ...org,
    balance: orgBalances[org.id] ?? null,
  }));

  const netWorth = Object.values(orgBalances).reduce(
    (sum: number, b: number) => sum + (Number(b) || 0),
    0
  );

  return {
    ...user,
    orgs,
    netWorth,
    activityCount: Number(user.activityCount) || 0,
    orgBalances: undefined,
  };
});
