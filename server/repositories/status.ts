import { query } from "../utils/db";

export async function getStatus() {
  const result = await query(
    'SELECT * FROM "status-check" WHERE "item" IN (1, 2, 3)'
  );
  return result.rows;
}
