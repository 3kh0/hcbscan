import { getUserById } from "../../repositories/users";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "User ID is required" });
  }

  const user = await getUserById(id);
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  return user;
});
