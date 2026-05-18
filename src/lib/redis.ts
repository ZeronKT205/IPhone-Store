import { Redis } from "@upstash/redis";

// ── In-memory fallback ─────────────────────────────────────────
// Used when UPSTASH_REDIS_REST_URL is not set (local dev without Redis)
class MemoryCache {
  private store = new Map<string, { v: unknown; ex: number }>();

  async get<T>(key: string): Promise<T | null> {
    const e = this.store.get(key);
    if (!e) return null;
    if (Date.now() > e.ex) { this.store.delete(key); return null; }
    return e.v as T;
  }

  async set(key: string, value: unknown, opts?: { ex: number }): Promise<"OK"> {
    this.store.set(key, {
      v: value,
      ex: opts ? Date.now() + opts.ex * 1000 : Date.now() + 3_600_000,
    });
    return "OK";
  }

  async del(...keys: string[]): Promise<number> {
    let count = 0;
    for (const k of keys) { if (this.store.delete(k)) count++; }
    return count;
  }

  // Flush all entries (used for full invalidation)
  async flushdb(): Promise<"OK"> { this.store.clear(); return "OK"; }
}

// ── Singleton (survives HMR in dev) ───────────────────────────
const g = globalThis as unknown as { __redis: Redis | MemoryCache };

if (!g.__redis) {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    g.__redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } else {
    g.__redis = new MemoryCache();
    if (process.env.NODE_ENV !== "test") {
      console.info("[cache] Redis not configured → using in-memory fallback (set UPSTASH_REDIS_REST_URL to enable Redis)");
    }
  }
}

export const redis = g.__redis;
export type RedisClient = typeof redis;
