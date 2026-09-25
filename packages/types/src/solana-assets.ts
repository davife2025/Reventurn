/**
 * Domain types for the Solana-side tokenized stock comparison, added in
 * Session 9, extended in Session 11 with a real on-chain read. Deliberately
 * parallel in shape to TokenizedAsset (assets.ts) so the two sections read
 * as one comparison, not two unrelated features.
 *
 * As of Session 11: mintAddress and onchainSupplyUi come from a real
 * Solana RPC call (getTokenSupply) against a mint address sourced from
 * Solana Foundation's own official case study — this is a genuine
 * on-chain read, not just an off-chain price feed. See solana-mints.ts
 * and solana-rpc.ts in apps/api for the verified source and the client.
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
  /**
   * Real on-chain data, added in Session 11. mintAddress is sourced from
   * Solana Foundation's own official case study (see solana-mints.ts),
   * not guessed. onchainSupplyUi is read live from Solana's network via
   * getTokenSupply — this is the actual on-chain read that was missing
   * when this feature only used Pyth's (cross-chain) price API.
   */
  mintAddress: string | null;
  explorerUrl: string | null;
  onchainSupplyUi: number | null;
}

export interface SolanaAssetList {
  assets: SolanaTokenizedAsset[];
  fetchedAt: string;
}
