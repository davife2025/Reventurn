/**
 * Client for Pyth Network's Hermes API.
 *
 * Verified in Session 9 research directly from Pyth's own docs, not
 * assumed from memory — and this one genuinely changed recently, worth
 * being explicit about:
 * - As of a core upgrade on August 26, 2026, every Hermes caller needs a
 *   Pyth API key (`Authorization: Bearer $PYTH_API_KEY`). Before that
 *   date Hermes was fully public/keyless — most examples still findable
 *   online reflect the old, no-longer-accurate behavior.
 * - This client uses the upgraded, Pyth-recommended base URL
 *   `https://pyth.dourolabs.app/hermes` rather than the legacy
 *   `hermes.pyth.network` (which still works but now needs the same key
 *   anyway, so there's no reason to build new code against the old host).
 * - Feed discovery: `GET /v2/price_feeds?query=<symbol>&asset_type=<type>`
 *   returns `[{ id, attributes }]`, confirmed from Pyth's own API
 *   reference. Feed IDs are resolved through this at request time —
 *   deliberately not hardcoded, since no hex ID for the xStock feeds
 *   (e.g. AAPLX) could be independently confirmed during research, and
 *   guessing one would be exactly the kind of fabrication this build
 *   avoids everywhere else (see the OKX integration in Session 3 for the
 *   same call).
 * - Price fetch: `GET /v2/updates/price/latest?ids[]=<id>&ids[]=<id2>`,
 *   confirmed real. Response parsing (price/expo/publish_time as the
 *   real value) follows Pyth's long-standing, stable convention
 *   documented consistently across their SDKs — coded defensively with
 *   optional chaining in case of minor shape differences.
 *
 * NOT verified: an actual live call — pyth.dourolabs.app isn't reachable
 * from this sandbox, same caveat as every other external integration in
 * this build. First real test needs a real PYTH_API_KEY.
 */

const PYTH_HERMES_BASE = "https://pyth.dourolabs.app/hermes";
const FETCH_TIMEOUT_MS = 8000;

interface PythFeedMetadata {
  id: string;
  attributes?: Record<string, string>;
}

interface PythParsedPrice {
  id: string;
  price?: {
    price: string;
    expo: number;
    publish_time: number;
  };
}

interface PythLatestPriceResponse {
  parsed?: PythParsedPrice[];
}

function getAuthHeaders(): Record<string, string> {
  const apiKey = process.env.PYTH_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing PYTH_API_KEY — check apps/api/.env against .env.example. Register at https://pythdata.app/signup"
    );
  }
  return { Authorization: `Bearer ${apiKey}` };
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { headers: getAuthHeaders(), signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Resolves a symbol to a Pyth feed id by searching, rather than trusting
 * a hardcoded id. Returns null (not a thrown error) if nothing matches —
 * a missing feed for one symbol shouldn't fail the whole request.
 */
export async function findFeedId(
  query: string,
  assetType: "crypto" | "equity"
): Promise<{ id: string; attributes?: Record<string, string> } | null> {
  const url = `${PYTH_HERMES_BASE}/v2/price_feeds?query=${encodeURIComponent(query)}&asset_type=${assetType}`;
  const res = await fetchWithTimeout(url);

  if (!res.ok) {
    throw new Error(`Pyth feed search error (${res.status}) for "${query}": ${res.statusText}`);
  }

  const results = (await res.json()) as PythFeedMetadata[];
  return results?.[0] ?? null;
}

export interface PythPriceResult {
  priceUsd: number;
  publishedAt: string;
}

/**
 * Fetches latest prices for multiple feed ids in one request. Returns a
 * map keyed by feed id; a feed with no usable price is simply absent from
 * the map rather than causing the whole call to fail.
 */
export async function getLatestPrices(
  feedIds: string[]
): Promise<Record<string, PythPriceResult>> {
  if (feedIds.length === 0) return {};

  const idsQuery = feedIds.map((id) => `ids[]=${encodeURIComponent(id)}`).join("&");
  const url = `${PYTH_HERMES_BASE}/v2/updates/price/latest?${idsQuery}`;
  const res = await fetchWithTimeout(url);

  if (!res.ok) {
    throw new Error(`Pyth price fetch error (${res.status}): ${res.statusText}`);
  }

  const data = (await res.json()) as PythLatestPriceResponse;
  const out: Record<string, PythPriceResult> = {};

  for (const item of data.parsed ?? []) {
    const p = item.price;
    if (!p) continue;
    const priceUsd = Number(p.price) * Math.pow(10, p.expo);
    if (!Number.isFinite(priceUsd)) continue;
    out[item.id] = {
      priceUsd,
      publishedAt: new Date(p.publish_time * 1000).toISOString()
    };
  }

  return out;
}
