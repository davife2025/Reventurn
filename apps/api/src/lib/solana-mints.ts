/**
 * Solana SPL (Token-2022) mint addresses for xStocks.
 *
 * Sourced directly from Solana Foundation's own official case study,
 * published August 18, 2025: https://solana.com/news/case-study-xstocks
 * — each address on that page is independently cross-linked to Solscan,
 * so it's checkable against two sources, not one. This is the specific
 * gap Session 9 flagged (no confirmed on-chain address, price data only)
 * — closed here with a primary, dated, official source rather than a
 * third-party tracker or a guess.
 *
 * Confirmed on the same page: xStocks are issued using Solana's Token
 * Extensions program (Token-2022), not the legacy SPL Token program —
 * relevant because it's why a generic, program-agnostic RPC method
 * (getTokenSupply) is used to read them in solana-rpc.ts, rather than
 * anything that assumes the older token program specifically.
 */
export const XSTOCK_SOLANA_MINTS: Record<string, string> = {
  AAPLX: "XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp",
  TSLAX: "XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB",
  NVDAX: "Xsc9qvGR1efVDFGLrVsmkzv3qi45LTBjeUKSPmx9qEh"
};

export function buildSolscanUrl(mintAddress: string): string {
  return `https://solscan.io/token/${mintAddress}`;
}
