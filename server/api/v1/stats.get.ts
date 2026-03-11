import {
  getOrgCount,
  getSumBalance,
  getVolume7d,
  getVolumePrevious,
} from "../../repositories/stats";
import { wrapOk } from "../../utils/api-envelope";

export default defineEventHandler(async (event) => {
  setHeader(event, "Cache-Control", "public, max-age=60, s-maxage=60");

  const [orgCount, sumBalance, volume7d, volumePrevious] = await Promise.all([
    getOrgCount(),
    getSumBalance(),
    getVolume7d(),
    getVolumePrevious(),
  ]);

  return wrapOk({
    total_organizations: orgCount,
    total_balance_cents: Number(sumBalance),
    activity_volume_7d: volume7d,
    activity_volume_previous_7d: volumePrevious,
  });
});
