import Redis from "ioredis";

let redis: Redis | null = null;
const url = process.env.REDIS_URL;

if (url) {
  redis = new Redis(url, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    retryStrategy: (t) => (t > 5 ? null : Math.min(t * 200, 2000)),
  });

  redis.on("error", (e) => console.error("[redis] conn error:", e.message));
  redis.connect().catch(() => { console.warn("[redis] failed to connect, falling back to memory"); redis = null; });
}

export const getRedis = (): Redis | null => redis;
