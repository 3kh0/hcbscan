import { query } from "../utils/db";

export async function getUserById(id: string) {
  const result = await query(
    'SELECT * FROM "hcb.hackclub.com-users" WHERE "id" = $1',
    [id]
  );
  return result.rows[0] ?? null;
}
