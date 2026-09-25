/**
 * Goal-based allocation planner — Session 10. This is a deliberately
 * narrow slice of the original brief's Layer 3 ("Goal-Based Investing
 * Engine"): allocation across CURRENCIES only, using real nominal policy
 * rates as the yield figure. It does not allocate across which stocks to
 * hold — there is no real "expected return" data for equities anywhere in
 * this codebase, and inventing one would be a fabricated financial
 * projection, not a rate comparison. Pure client-side computation, no
 * execution, no custody.
 */

export interface AllocationSuggestion {
  currency: string;
  ratePercent: number;
  weightPercent: number;
}

export interface AllocationPlan {
  targetAnnualReturnPercent: number;
  achievedPercent: number;
  achievable: boolean;
  suggestions: AllocationSuggestion[];
}
