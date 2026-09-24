/**
 * Domain types for the rate-differential engine. Added in Session 2 — per
 * the ruleset, domain types belong to the theme session that needs them,
 * not invented speculatively in infra.
 */

export type CurrencyCode = "USD" | "EUR" | "JPY" | "CNY";

/** Static config for one tracked series — not fetched, defined in code. */
export interface RateSeriesConfig {
  currency: CurrencyCode;
  label: string;
  fredSeriesId: string;
  /** Honest note on update cadence / known staleness for this series. */
  sourceNote: string;
}

/** One normalized, live observation returned by apps/api. */
export interface RateObservation {
  currency: CurrencyCode;
  label: string;
  fredSeriesId: string;
  /** Observation date as reported by FRED, not the fetch time. */
  date: string;
  ratePercent: number;
  sourceNote: string;
}

export interface RateComparison {
  observations: RateObservation[];
  highest: RateObservation | null;
  lowest: RateObservation | null;
  /** highest.ratePercent - lowest.ratePercent, rounded to 3dp. */
  spreadPercent: number | null;
  fetchedAt: string;
}
