import { query } from "../../../utils/db";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Organization ID is required",
    });
  }

  const result = await query(
    `SELECT "Organization ID", "Name", "Slug", "Category", "Balance", "Added", "Frozen At"
     FROM "hcb.hackclub.com"
     WHERE "Organization ID" = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    return { found: false };
  }

  const row = result.rows[0];
  return {
    found: true,
    org: {
      id: row["Organization ID"],
      name: row["Name"],
      slug: row["Slug"],
      category: row["Category"],
      balance_cents: Number(row["Balance"]),
      frozen_at: row["Frozen At"],
    },
  };
});
