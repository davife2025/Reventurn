/**
 * Minimal Solana JSON-RPC client. Deliberately not using @solana/web3.js
 * for this — a single read-only getTokenSupply call is a plain JSON-RPC
 * 2.0 POST, and pulling in the full SDK for one method would be a heavy
 * dependency for what it's doing. Same "plain fetch over an SDK" choice
 * already made for FRED, OKX, Pyth, and Hugging Face in this build.
 * @solana/web3.js would be the right call if this ever needs to build or
 * sign a transaction — reads alone don't need it.
 *
 * getTokenSupply is one of Solana's original, stable, core RPC methods
 * (unlike Pyth's Hermes API, which genuinely changed recently) — high
 * confidence in this shape without needing to flag the same kind of
 * "verify this changed recently" caveat as Pyth got in Session 9.
 *
 * Default RPC is Solana's public mainnet endpoint — free, no signup, but
 * explicitly rate-limited by Solana for shared/production use. Override
 * with SOLANA_RPC_URL (a dedicated provider like Helius or QuickNode) for
 * anything beyond light, cached, demo-scale traffic.
 *
 * NOT verified: an actual live call — api.mainnet-beta.solana.com isn't
 * reachable from this sandbox, same caveat as every other external
 * integration in this build.
 */

const DEFAULT_RPC_URL = "https://api.mainnet-beta.solana.com";
const FETCH_TIMEOUT_MS = 8000;

export interface TokenSupplyResult {
  /** Raw supply in base units, as a string (a u64 can exceed JS number precision). */
  amount: string;
  decimals: number;
  uiAmount: number | null;
}

interface RpcResponse {
  result?: {
    value?: { amount: string; decimals: number; uiAmount: number | null };
  };
  error?: { message: string };
}

/**
 * Reads the real, current supply of an SPL mint directly from Solana's
 * network. Returns null (not a thrown error) if the RPC call succeeds
 * but the account isn't a valid mint — that's a data problem for that
 * one token, not a failure worth taking down the whole response for.
 */
export async function getTokenSupply(
  mintAddress: string
): Promise<TokenSupplyResult | null> {
  const rpcUrl = process.env.SOLANA_RPC_URL || DEFAULT_RPC_URL;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getTokenSupply",
        params: [mintAddress]
      }),
      signal: controller.signal
    });

    if (!res.ok) {
      throw new Error(`Solana RPC error (${res.status}): ${res.statusText}`);
    }

    const data = (await res.json()) as RpcResponse;

    if (data.error) {
      throw new Error(`Solana RPC error: ${data.error.message}`);
    }

    const value = data.result?.value;
    if (!value) return null;

    return {
      amount: value.amount,
      decimals: value.decimals,
      uiAmount: value.uiAmount
    };
  } finally {
    clearTimeout(timeout);
  }
}
