import { getActivitiesByUserId } from "../../../repositories/activities";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "User ID is required" });
  }

  const params = getQuery(event);
  const page = Math.max(parseInt(String(params.page || "1"), 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(String(params.limit || "25"), 10) || 25, 1), 100);
  const offset = (page - 1) * limit;

  const activities = await getActivitiesByUserId(id, limit, offset);
  return activities;
});
