import { getActivities } from "../repositories/activities";

export default defineEventHandler(async (event) => {
  const params = getQuery(event);
  const page = Math.max(parseInt(String(params.page || "1"), 10) || 1, 1);
  const limit = Math.min(
    Math.max(parseInt(String(params.limit || "50"), 10) || 50, 1),
    100
  );
  const offset = (page - 1) * limit;

  const activities = await getActivities(limit, offset);
  return activities;
});
