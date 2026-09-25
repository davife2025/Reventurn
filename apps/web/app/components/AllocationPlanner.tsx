"use client";

import { useState, useMemo } from "react";
import { Button } from "@reventurn/ui";
import type { RateObservation } from "@reventurn/types";
import { computeAllocationPlan } from "../lib/allocation";

/**
 * Session 10. Deliberately not a "recommendation" — computeAllocationPlan
 * only blends real observed currency rates to hit a stated target, never
 * predicts a return. The copy here is written to stay on the right side
 * of that line (see also the chat assistant's own system prompt, which
 * carries the same rule).
 */
export function AllocationPlanner({
  observations
}: {
  observations: RateObservation[];
}) {
  const [target, setTarget] = useState("3.5");

  const plan = useMemo(() => {
    const parsed = Number(target);
    if (!Number.isFinite(parsed) || observations.length === 0) return null;
    return computeAllocationPlan(observations, parsed);
  }, [target, observations]);

  return (
    <section className="rounded-lg border border-graphite-700 p-4">
      <h2 className="flex items-center gap-2 font-heading text-sm font-medium text-graphite-200">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="text-amber-500">
          <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        What would it take to hit a target?
      </h2>
      <p className="mt-1 text-xs text-graphite-500">
        A blend of today&rsquo;s real currency rates that gets closest to a
        target annual return. This is a calculation on live rate data, not
        a recommendation, a prediction, or an executed trade.
      </p>

      <div className="mt-4 flex items-center gap-2">
        <label htmlFor="target-return" className="text-sm text-graphite-300">
          Target annual return
        </label>
        <input
          id="target-return"
          type="number"
          step="0.1"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="w-20 rounded-md border border-graphite-600 bg-graphite-800 px-2 py-1 text-right font-data text-sm text-graphite-50 focus:border-amber-500 focus:outline-none"
        />
        <span className="text-sm text-graphite-400">%</span>
      </div>

      {plan && (
        <div className="mt-4">
          {!plan.achievable && (
            <p className="mb-2 font-data text-xs text-rust-500">
              No combination of today&rsquo;s tracked rates reaches{" "}
              {plan.targetAnnualReturnPercent}% — closest achievable shown
              below.
            </p>
          )}
          <div className="flex h-6 w-full overflow-hidden rounded-md border border-graphite-700">
            {plan.suggestions
              .filter((s) => s.weightPercent > 0)
              .map((s) => (
                <div
                  key={s.currency}
                  style={{ width: `${s.weightPercent}%` }}
                  className="flex items-center justify-center bg-amber-500 text-[10px] font-medium text-graphite-950 first:bg-amber-500 [&:not(:first-child)]:bg-graphite-600 [&:not(:first-child)]:text-graphite-50"
                  title={`${s.currency}: ${s.weightPercent}%`}
                >
                  {s.weightPercent >= 12 ? `${s.currency} ${s.weightPercent}%` : ""}
                </div>
              ))}
          </div>
          <p className="mt-2 font-data text-sm text-graphite-300">
            This blend averages to{" "}
            <span className="font-medium text-graphite-50">
              {plan.achievedPercent.toFixed(2)}%
            </span>
            .
          </p>
        </div>
      )}
    </section>
  );
}
