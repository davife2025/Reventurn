/**
 * Domain types for the Solana-side tokenized stock comparison, added in
 * Session 9. Deliberately parallel in shape to TokenizedAsset (assets.ts)
 * so the two sections read as one comparison, not two unrelated features.
 *
 * Scope note: this reads Pyth's price data only — it does not read
 * on-chain Solana state directly (no @solana/web3.js, no SPL mint
 * address resolution). "Why this belongs on Solana" here rests on xStocks
 * being real tokens that trade on Solana today, not on a literal on-chain
 * read from this codebase. See SESSION_REPORT.md for the full scope call.
 */

export interface SolanaTokenizedAsset {
  /** e.g. "AAPLX" */
  xstockSymbol: string;
  /** e.g. "AAPL" */
  underlyingSymbol: string;
  label: string;
  /** Pyth feed id for the xStock (Crypto.<SYMBOL>/USD), resolved live, not hardcoded. */
  xstockFeedId: string | null;
  /** Pyth feed id for the real equity (Equity.US.<SYMBOL>/USD), resolved live. */
  equityFeedId: string | null;
  xstockPriceUsd: number | null;
  equityPriceUsd: number | null;
  /** xstockPriceUsd / equityPriceUsd — how tightly the token tracks the real asset. */
  pegRatio: number | null;
  /** Pyth's publish_time for the xStock price, as an ISO string. */
  publishedAt: string | null;
}

export interface SolanaAssetList {
  assets: SolanaTokenizedAsset[];
  fetchedAt: string;
}
