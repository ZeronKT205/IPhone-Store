import { redis } from "./redis";

// ── TTL constants (seconds) ───────────────────────────────────
export const TTL = {
  DASHBOARD: 60,        // 1 min — refreshes quickly, real-time feel
  REPORTS:   300,       // 5 min — expensive queries, data changes slowly
  PRODUCTS:  600,       // 10 min — changes only via admin actions
  CATEGORIES: 1800,     // 30 min — almost never changes
} as const;

// ── In-flight deduplication (thundering herd protection) ──────
// If N concurrent requests all miss the same cache key simultaneously,
// only the first fires the DB query — the rest await the same Promise.
const inflight = new Map<string, Promise<unknown>>();

// ── Core get/set/del ──────────────────────────────────────────
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    return await redis.get<T>(key);
  } catch {
    return null; // degrade gracefully — never let cache errors block requests
  }
}

export async function cacheSet<T>(key: string, value: T, ttl: number): Promise<void> {
  try {
    await redis.set(key, value, { ex: ttl });
  } catch {
    // ignore write errors
  }
}

export async function cacheDel(...keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  try {
    await redis.del(...keys);
  } catch {
    // ignore
  }
}

// ── withCache: main wrapper ───────────────────────────────────
// Returns cached value immediately (HIT) or runs fn, caches result, returns it (MISS).
// On concurrent identical key misses, only one fn() fires (dedup).
export async function withCache<T>(
  key: string,
  ttl: number,
  fn: () => Promise<T>,
): Promise<{ data: T; hit: boolean }> {
  const cached = await cacheGet<T>(key);
  if (cached !== null) return { data: cached, hit: true };

  // Deduplicate concurrent misses on same key
  const existing = inflight.get(key) as Promise<T> | undefined;
  if (existing) {
    const data = await existing;
    return { data, hit: false };
  }

  const promise = fn().then(async (data) => {
    await cacheSet(key, data, ttl);
    inflight.delete(key);
    return data;
  }).catch((err) => {
    inflight.delete(key);
    throw err;
  });

  inflight.set(key, promise);
  const data = await promise;
  return { data, hit: false };
}

// ── Domain-specific keys ──────────────────────────────────────
export function reportKey(period: string, year: number) {
  return `report:${period}:${year}`;
}
export const DASHBOARD_KEY = "dashboard";
export const PRODUCTS_KEY  = "products:all";
export const CATEGORIES_KEY = "categories:all";

// ── Invalidation helpers ──────────────────────────────────────

export async function invalidateDashboard(): Promise<void> {
  await cacheDel(DASHBOARD_KEY);
}

// Invalidates reports for current year + year param (if given)
export async function invalidateReports(year?: number): Promise<void> {
  const thisYear = new Date().getFullYear();
  const years = year ? [year, thisYear] : [thisYear];
  const periods = ["month", "quarter", "year"];
  const keys = years.flatMap(y => periods.map(p => reportKey(p, y)));
  await cacheDel(...keys);
}

export async function invalidateProducts(): Promise<void> {
  await cacheDel(PRODUCTS_KEY);
}

export async function invalidateCategories(): Promise<void> {
  await cacheDel(CATEGORIES_KEY);
}

// Invalidate everything order-related (dashboard + reports)
export async function invalidateOnOrderChange(year?: number): Promise<void> {
  await Promise.all([invalidateDashboard(), invalidateReports(year)]);
}
