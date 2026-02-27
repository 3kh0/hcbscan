import pg from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

export const pool = new pg.Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  statement_timeout: 10_000,
  idle_in_transaction_session_timeout: 30_000,
});

pool.on("error", (err) => {
  console.error("Unexpected database pool error:", err.message);
});

export async function query(text: string, params: unknown[] = []) {
  return pool.query(text, params);
}
