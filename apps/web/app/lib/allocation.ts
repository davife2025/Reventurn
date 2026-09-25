import type { AllocationPlan, AllocationSuggestion, RateObservation } from "@reventurn/types";

/**
 * Computes a simple two-currency blend that averages to the target rate,
 * using only real observed nominal rates — never a predicted or invented
 * return. If the target is outside the achievable range (below the
 * lowest rate or above the highest), returns the closest single-currency
 * allocation and flags achievable: false rather than pretending a blend
 * can exceed what's actually on offer.
 *
 * This is intentionally simple (a linear interpolation between the two
 * bracketing currencies, not a real portfolio optimizer) — the point is
 * an honest, explainable answer from real data, not sophistication for
 * its own sake.
 */
export function computeAllocationPlan(
  observations: RateObservation[],
  targetAnnualReturnPercent: number
): AllocationPlan {
  const sorted = [...observations].sort((a, b) => a.ratePercent - b.ratePercent);

  if (sorted.length === 0) {
    return {
      targetAnnualReturnPercent,
      achievedPercent: 0,
      achievable: false,
      suggestions: []
    };
  }

  const lowest = sorted[0]!;
  const highest = sorted[sorted.length - 1]!;

  // Target below the lowest available rate: any single currency clears it;
  // suggest the lowest (often the "safest"/most accessible) at 100%.
  if (targetAnnualReturnPercent <= lowest.ratePercent) {
    return {
      targetAnnualReturnPercent,
      achievedPercent: lowest.ratePercent,
      achievable: true,
      suggestions: [
        { currency: lowest.currency, ratePercent: lowest.ratePercent, weightPercent: 100 }
      ]
    };
  }

  // Target above the highest available rate: not achievable from this
  // data — show the closest we can get (100% in the highest), flagged.
  // Strictly greater-than: hitting the target exactly via 100% in the
  // highest currency IS achievable, only exceeding it isn't.
  if (targetAnnualReturnPercent > highest.ratePercent) {
    return {
      targetAnnualReturnPercent,
      achievedPercent: highest.ratePercent,
      achievable: false,
      suggestions: [
        { currency: highest.currency, ratePercent: highest.ratePercent, weightPercent: 100 }
      ]
    };
  }

  // Target is between the lowest and highest rate: find the two
  // currencies whose rates bracket it most tightly, then solve for the
  // weight w such that w*high + (1-w)*low = target.
  let low = lowest;
  let high = highest;
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i]!;
    const b = sorted[i + 1]!;
    if (targetAnnualReturnPercent >= a.ratePercent && targetAnnualReturnPercent <= b.ratePercent) {
      low = a;
      high = b;
      break;
    }
  }

  const span = high.ratePercent - low.ratePercent;
  const weightHigh = span === 0 ? 0 : (targetAnnualReturnPercent - low.ratePercent) / span;
  const weightHighPercent = Math.round(weightHigh * 100);
  const weightLowPercent = 100 - weightHighPercent;

  const suggestions: AllocationSuggestion[] = [
    { currency: high.currency, ratePercent: high.ratePercent, weightPercent: weightHighPercent },
    { currency: low.currency, ratePercent: low.ratePercent, weightPercent: weightLowPercent }
  ];

  const achievedPercent =
    (weightHighPercent / 100) * high.ratePercent + (weightLowPercent / 100) * low.ratePercent;

  return {
    targetAnnualReturnPercent,
    achievedPercent: Number(achievedPercent.toFixed(3)),
    achievable: true,
    suggestions
  };
}
