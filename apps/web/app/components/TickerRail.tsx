import type { RateComparison } from "@reventurn/types";

/**
 * Persistent thin strip showing the current spread leader at a glance —
 * the signature element from Session 4's design pass. Takes already-
 * fetched data as a prop rather than fetching itself, so it stays a pure
 * presentational component and the page controls loading/error states.
 */
export function TickerRail({ rates }: { rates: RateComparison | null }) {
  if (!rates || !rates.highest || !rates.lowest || rates.spreadPercent === null) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-graphite-700 px-3 py-1.5 font-data text-xs text-graphite-400">
        Rate data unavailable
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-graphite-700 px-3 py-1.5 font-data text-xs">
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden="true"
        className="shrink-0 text-amber-500"
      >
        <path
          d="M2 10 L5 5 L8 8 L12 3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-graphite-400">Highest yield right now</span>
      <span className="font-medium text-amber-400">
        {rates.highest.currency} {rates.highest.ratePercent.toFixed(2)}%
      </span>
      <span className="text-graphite-600">&middot;</span>
      <span className="text-graphite-400">
        spread vs {rates.lowest.currency}
      </span>
      <span className="font-medium text-graphite-50">
        {rates.spreadPercent.toFixed(2)}pp
      </span>
    </div>
  );
}
