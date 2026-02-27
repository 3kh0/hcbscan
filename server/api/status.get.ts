import { getStatus } from "../repositories/status";

export default defineEventHandler(async () => {
  return await getStatus();
});
