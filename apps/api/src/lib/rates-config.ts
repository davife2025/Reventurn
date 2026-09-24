import type { RateSeriesConfig } from "@reventurn/types";

/**
 * The four series from the business brief, each verified to exist on FRED
 * during Session 2 research (real series IDs, not guessed). Update cadence
 * varies significantly by country — see sourceNote on each. China and
 * Japan are OECD-sourced through FRED rather than coming directly from
 * PBOC/BOJ, and lag noticeably behind the US/EU series.
 */
export const TRACKED_RATE_SERIES: RateSeriesConfig[] = [
  {
    currency: "USD",
    label: "US Federal Funds Effective Rate",
    fredSeriesId: "FEDFUNDS",
    sourceNote:
      "Monthly, direct from the Federal Reserve via FRED. Typically the freshest series here."
  },
  {
    currency: "EUR",
    label: "ECB Deposit Facility Rate",
    fredSeriesId: "ECBDFR",
    sourceNote: "Daily, direct from the European Central Bank via FRED."
  },
  {
    currency: "JPY",
    label: "Japan Call Money / Interbank Rate",
    fredSeriesId: "IRSTCI01JPM156N",
    sourceNote:
      "Monthly, OECD-sourced via FRED rather than direct from the BOJ — commonly lags the live policy rate by 1-2 months."
  },
  {
    currency: "CNY",
    label: "China Central Bank Rate",
    fredSeriesId: "IRSTCB01CNM156N",
    sourceNote:
      "Monthly, OECD-sourced via FRED rather than direct from the PBOC — historically the slowest-updating series tracked here. Treat as directional, not real-time."
  }
];
