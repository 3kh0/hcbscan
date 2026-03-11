import type { H3Event } from "h3";
import { getRedis } from "./redis";

const WINDOW = 60;
const LIMIT = 60;
const store = new Map<string, { count: number; reset: number }>();

function clientIp(event: H3Event): string {
  const h = getHeaders(event);
  const fwd = h["x-forwarded-for"];
  return fwd ? fwd.split(",")[0].trim() : h["x-real-ip"] || "unknown";
}

function cleanStore() {
  const now = Date.now();
  for (const [k, v] of store) if (v.reset < now) store.delete(k);
}

async function check(
  key: string,
  limit: number
): Promise<{ allowed: boolean; remaining: number; reset: number }> {
  const redis = getRedis();
  if (!redis) return checkMem(key, limit);

  const now = Math.floor(Date.now() / 1000);
  const wk = `rl:${key}:${now - (now % WINDOW)}`;
  const reset = now - (now % WINDOW) + WINDOW;
  const count = await redis.incr(wk);
  if (count === 1) await redis.expire(wk, WINDOW + 1);

  return { allowed: count <= limit, remaining: Math.max(0, limit - count), reset };
}

function checkMem(
  key: string,
  limit: number
): { allowed: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const resetAt = now + WINDOW * 1000;

  if (store.size > 10_000) cleanStore();

  const e = store.get(key);
  if (!e || e.reset < now) {
    store.set(key, { count: 1, reset: resetAt });
    return { allowed: true, remaining: limit - 1, reset: Math.floor(resetAt / 1000) };
  }

  e.count++;
  return {
    allowed: e.count <= limit,
    remaining: Math.max(0, limit - e.count),
    reset: Math.floor(e.reset / 1000),
  };
}

export async function applyRateLimit(event: H3Event): Promise<void> {
  const r = await check(clientIp(event), LIMIT);

  setHeaders(event, {
    "X-RateLimit-Limit": String(LIMIT),
    "X-RateLimit-Remaining": String(r.remaining),
    "X-RateLimit-Reset": String(r.reset),
  });

  if (!r.allowed) {
    throw createError({
      statusCode: 429,
      data: {
        ok: false,
        error: {
          code: "RATE_LIMITED",
          message: `Rate limit exceeded! Try again in ${r.reset - Math.floor(Date.now() / 1000)} seconds.`,
        },
      },
    });
  }
}
