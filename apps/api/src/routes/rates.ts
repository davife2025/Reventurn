import { Router } from "express";
import type {
  ApiResponse,
  RateComparison,
  RateObservation
} from "@reventurn/types";
import { TRACKED_RATE_SERIES } from "../lib/rates-config";
import { fetchLatestFredObservation } from "../lib/fred";
import { getCached, setCached } from "../lib/cache";

export const ratesRouter = Router();

const CACHE_KEY = "rate-comparison";
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

ratesRouter.get("/", async (_req, res) => {
  const cached = getCached<RateComparison>(CACHE_KEY);
  if (cached) {
    const body: ApiResponse<RateComparison> = { ok: true, data: cached };
    res.status(200).json(body);
    return;
  }

  try {
    const results = await Promise.allSettled(
      TRACKED_RATE_SERIES.map(async (config) => {
        const latest = await fetchLatestFredObservation(config.fredSeriesId);
        if (!latest) return null;

        const observation: RateObservation = {
          currency: config.currency,
          label: config.label,
          fredSeriesId: config.fredSeriesId,
          date: latest.date,
          ratePercent: Number(latest.value),
          sourceNote: config.sourceNote
        };
        return observation;
      })
    );

    const observations: RateObservation[] = results
      .filter(
        (r): r is PromiseFulfilledResult<RateObservation | null> =>
          r.status === "fulfilled"
      )
      .map((r) => r.value)
      .filter((v): v is RateObservation => v !== null);

    if (observations.length === 0) {
      const body: ApiResponse<RateComparison> = {
        ok: false,
        error:
          "No rate observations available from FRED right now — all tracked series failed or returned no data."
      };
      res.status(502).json(body);
      return;
    }

    const sorted = [...observations].sort(
      (a, b) => b.ratePercent - a.ratePercent
    );
    const highest = sorted[0]!;
    const lowest = sorted[sorted.length - 1]!;

    const comparison: RateComparison = {
      observations,
      highest,
      lowest,
      spreadPercent: Number((highest.ratePercent - lowest.ratePercent).toFixed(3)),
      fetchedAt: new Date().toISOString()
    };

    setCached(CACHE_KEY, comparison, CACHE_TTL_MS);

    const body: ApiResponse<RateComparison> = { ok: true, data: comparison };
    res.status(200).json(body);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error fetching rate data";
    const body: ApiResponse<RateComparison> = { ok: false, error: message };
    res.status(502).json(body);
  }
});
