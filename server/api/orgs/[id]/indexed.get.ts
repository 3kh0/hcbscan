import { isOrgIndexed } from "../../../repositories/orgs";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Organization ID is required" });
  }

  const indexed = await isOrgIndexed(id);
  return { indexed };
});
