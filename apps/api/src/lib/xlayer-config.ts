/**
 * X Layer network facts, verified directly from OKX's developer docs in
 * Session 3 research (not assumed): chain ID 196, mainnet RPC and
 * block-explorer URLs, and the OKX Market API's chainIndex/issuer codes
 * for xStocks.
 */

export const X_LAYER_CHAIN_ID = 196;
export const X_LAYER_CHAIN_INDEX = "196"; // OKX Market API uses this as a string param
export const X_LAYER_RPC_URL = "https://rpc.xlayer.tech";
export const X_LAYER_EXPLORER_BASE = "https://www.okx.com/web3/explorer/xlayer";

/** OKX's RWA Token List `issuer` code for xStocks (Backed Assets), per their docs. */
export const OKX_RWA_ISSUER_XSTOCKS = "36";
/** `category` code for "All" categories, per their docs. */
export const OKX_RWA_CATEGORY_ALL = "47";

export function buildExplorerTokenUrl(contractAddress: string): string {
  return `${X_LAYER_EXPLORER_BASE}/address/${contractAddress}`;
}
