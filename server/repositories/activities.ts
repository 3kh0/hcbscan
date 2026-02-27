import { query } from "../utils/db";

export async function getActivities(limit: number, offset: number = 0) {
  const result = await query(
    `SELECT * FROM "hcb.hackclub.com-acts"
     ORDER BY "Created At" DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return result.rows;
}
