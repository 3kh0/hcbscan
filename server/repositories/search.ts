import { query } from "../utils/db";

export async function searchOrgs(q: string, limit: number = 15) {
  const pattern = `%${q}%`;
  const result = await query(
    `SELECT * FROM "hcb.hackclub.com"
     WHERE "Name" ILIKE $1 OR "Slug" ILIKE $1 OR "Organization ID" ILIKE $1
     LIMIT $2`,
    [pattern, limit]
  );
  return result.rows;
}

export async function searchUsers(q: string, limit: number = 15) {
  const pattern = `%${q}%`;
  const result = await query(
    `SELECT * FROM "hcb.hackclub.com-users"
     WHERE "name" ILIKE $1 OR "id" ILIKE $1
     LIMIT $2`,
    [pattern, limit]
  );
  return result.rows;
}
