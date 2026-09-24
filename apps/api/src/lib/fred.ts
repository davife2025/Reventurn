/**
 * Client for the FRED (Federal Reserve Economic Data) API.
 *
 * Verified in Session 0/2 research (not assumed from memory): the real,
 * documented endpoint is GET https://api.stlouisfed.org/fred/series/observations
 * with series_id, api_key and file_type=json as query params. Requires a
 * free FRED API key — see apps/api/.env.example.
 *
 * NOTE: this file typechecks and builds, but has NOT been execution-tested
 * against the live FRED API from this build session — api.stlouisfed.org is
 * not reachable from this sandbox's network. First live test happens in a
 * real dev environment with a real FRED_API_KEY. Flagging this explicitly
 * rather than claiming more than was actually verified.
 */

const FRED_OBSERVATIONS_URL =
  "https://api.stlouisfed.org/fred/series/observations";

const FETCH_TIMEOUT_MS = 8000;

export interface FredObservation {
  date: string;
  /** FRED returns numeric values as strings; "." means missing/unavailable. */
  value: string;
}

interface FredObservationsResponse {
  observations?: FredObservation[];
}

/**
 * Fetches the single most recent observation for a FRED series.
 * Returns null (not a thrown error) if the latest value is FRED's "."
 * missing-data sentinel — a missing datapoint is a normal, expected state
 * for some of these series, not a failure.
 */
export async function fetchLatestFredObservation(
  seriesId: string
): Promise<FredObservation | null> {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing FRED_API_KEY — check apps/api/.env against .env.example. Get a free key at https://fred.stlouisfed.org/docs/api/api_key.html"
    );
  }

  const url = new URL(FRED_OBSERVATIONS_URL);
  url.searchParams.set("series_id", seriesId);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("file_type", "json");
  url.searchParams.set("sort_order", "desc");
  url.searchParams.set("limit", "1");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url.toString(), { signal: controller.signal });

    if (!res.ok) {
      throw new Error(
        `FRED API error for series ${seriesId}: ${res.status} ${res.statusText}`
      );
    }

    const data = (await res.json()) as FredObservationsResponse;
    const latest = data.observations?.[0];

    if (!latest || latest.value === ".") {
      return null;
    }

    return latest;
  } finally {
    clearTimeout(timeout);
  }
}
