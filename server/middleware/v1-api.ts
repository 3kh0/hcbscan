import { applyRateLimit } from "../utils/rate-limit";

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname;
  if (!path.startsWith("/api/v1/")) return;

  setHeaders(event, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Expose-Headers":
      "X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset",
  });

  if (getMethod(event) === "OPTIONS") {
    setResponseStatus(event, 204);
    return "";
  }

  await applyRateLimit(event);
});
