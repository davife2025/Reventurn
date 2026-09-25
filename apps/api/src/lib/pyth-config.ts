/**
 * Kept deliberately small (3 symbols) for this session's scope. Chosen to
 * overlap with what's already shown in the X Layer table (AAPL, TSLA) so
 * the cross-chain comparison is direct and checkable, plus one more
 * (NVDA) for breadth. Feed IDs for these are resolved live via
 * findFeedId() in pyth.ts — nothing here is a hex id.
 */
export const TRACKED_XSTOCK_SYMBOLS = [
  { xstockSymbol: "AAPLX", equitySymbol: "AAPL", label: "Apple" },
  { xstockSymbol: "TSLAX", equitySymbol: "TSLA", label: "Tesla" },
  { xstockSymbol: "NVDAX", equitySymbol: "NVDA", label: "Nvidia" }
];
