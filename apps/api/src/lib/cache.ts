/**
 * Deliberately minimal in-process cache. Good enough to stop every page
 * load from re-hitting FRED, but it resets on server restart and is NOT
 * shared across multiple server instances. A real scheduled-ingestion job
 * (writing to Supabase, per the brief's "Operations" section) is future
 * work, not built in this session — noted in SESSION_REPORT.md.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

export function getCached<T>(key: string): T | undefined {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry.value as T;
}

export function setCached<T>(key: string, value: T, ttlMs: number): void {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}
