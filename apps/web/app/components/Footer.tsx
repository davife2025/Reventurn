import type { ApiResponse, HealthStatus } from "@reventurn/types";

/**
 * Session 8: replaces the old "apps/api health" debug section (raw status
 * text sitting in its own bordered card on the main page — not something
 * a real visitor should see) with a small, unobtrusive status dot folded
 * into the footer. The underlying /health endpoint and check are
 * unchanged; only where/how it's surfaced changed.
 */
export function Footer({ health }: { health: ApiResponse<HealthStatus> | null }) {
  const isUp = health?.ok ?? false;

  return (
    <footer className="mx-auto mt-4 flex max-w-3xl flex-col gap-3 border-t border-graphite-800 px-6 py-6 text-xs text-graphite-500 sm:flex-row sm:items-center sm:justify-between">
      <p className="max-w-xl">
        Reventurn shows live public rate and market data for informational
        purposes only — nothing here is financial advice. Nominal rates
        shown, not adjusted for inflation.
      </p>
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <span
            className={
              isUp
                ? "h-1.5 w-1.5 rounded-full bg-sage-500"
                : "h-1.5 w-1.5 rounded-full bg-rust-500"
            }
            aria-hidden="true"
          />
          {isUp ? "systems live" : "api unreachable"}
        </span>
        <span>&copy; {new Date().getFullYear()} reventurn</span>
      </div>
    </footer>
  );
}
