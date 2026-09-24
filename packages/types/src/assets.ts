/**
 * Domain types for the X Layer tokenized-stock (RWA) integration, added
 * in Session 3. Deliberately mirrors the real OKX Market API response
 * fields (see apps/api/src/lib/okx-client.ts) rather than inventing our
 * own shape — contract addresses come from that API at request time, not
 * from any hardcoded list.
 */

export interface TokenizedAsset {
  /** e.g. "AAPLx" */
  tokenSymbol: string;
  /** e.g. "AAPLx" (full token name as OKX reports it) */
  tokenName: string;
  /** Underlying ticker, e.g. "AAPL" */
  stockCode: string;
  /** On-chain ERC-20 contract address on X Layer, all-lowercase. */
  tokenContractAddress: string;
  /** OKX's chain identifier — 196 for X Layer, always this value here. */
  chainIndex: string;
  /** Block explorer link for tokenContractAddress, built client-side. */
  explorerUrl: string;
  issuer: string;
  /** On-chain DEX price in USD, or null if OKX reported an empty string. */
  onchainPriceUsd: number | null;
  priceChange24hPercent: number | null;
  /** Underlying real-world stock/ETF price in USD, updated ~every 15s by OKX. */
  stockPriceUsd: number | null;
  /** Ratio of token price to underlying asset price — how tightly the peg holds. */
  tokenToAssetRatio: number | null;
  volume24hUsd: number | null;
  marketCapUsd: number | null;
  peRatioTTM: number | null;
}

export interface TokenizedAssetList {
  assets: TokenizedAsset[];
  fetchedAt: string;
}
