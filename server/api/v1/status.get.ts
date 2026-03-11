import { getStatus } from "../../repositories/status";
import { wrapOk } from "../../utils/api-envelope";

export default defineEventHandler(async (event) => {
  setHeader(event, "Cache-Control", "public, max-age=30, s-maxage=30");

  const rows = await getStatus();

  const services: Record<string, boolean> = {};
  for (const row of rows as any[]) {
    services[`service_${row.item}`] = row.online;
  }

  return wrapOk({
    api_version: "v1",
    status: "operational",
    services,
  });
});
