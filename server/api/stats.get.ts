import {
  getOrgCount,
  getSumBalance,
  getVolume7d,
  getVolumePrevious,
} from "../repositories/stats";

export default defineEventHandler(async () => {
  const [orgCount, sumBalance, volume7d, volumePrevious] = await Promise.all([
    getOrgCount(),
    getSumBalance(),
    getVolume7d(),
    getVolumePrevious(),
  ]);

  return {
    accounts: orgCount,
    balance: sumBalance,
    volume7d,
    volumePrevious,
  };
});
