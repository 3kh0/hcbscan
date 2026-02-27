import { query } from "../utils/db";

export async function getOrgCount() {
  const result = await query('SELECT COUNT(*) FROM "hcb.hackclub.com"');
  return parseInt(result.rows[0].count, 10);
}

export async function getSumBalance() {
  const result = await query('SELECT SUM("Balance") FROM "hcb.hackclub.com"');
  return result.rows[0].sum ?? 0;
}

export async function getVolume7d() {
  const result = await query(
    `SELECT COUNT(*) FROM "hcb.hackclub.com-acts" WHERE "Created At" >= NOW() - INTERVAL '7 days'`
  );
  return parseInt(result.rows[0].count, 10);
}

export async function getVolumePrevious() {
  const result = await query(
    `SELECT COUNT(*) FROM "hcb.hackclub.com-acts" WHERE "Created At" >= NOW() - INTERVAL '14 days' AND "Created At" < NOW() - INTERVAL '7 days'`
  );
  return parseInt(result.rows[0].count, 10);
}
