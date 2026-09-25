import { Router } from "express";
import type {
  ApiResponse,
  SolanaAssetList,
  SolanaTokenizedAsset
} from "@reventurn/types";
import { TRACKED_XSTOCK_SYMBOLS } from "../lib/pyth-config";
import { findFeedId, getLatestPrices } from "../lib/pyth";
import { XSTOCK_SOLANA_MINTS, buildSolscanUrl } from "../lib/solana-mints";
import { getTokenSupply } from "../lib/solana-rpc";
import { getCached, setCached } from "../lib/cache";

export const solanaAssetsRouter = Router();

const CACHE_KEY = "solana-xstocks";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes, matching the X Layer assets cache

interface ResolvedSymbol {
  xstockSymbol: string;
  underlyingSymbol: string;
  label: string;
  xstockFeedId: string | null;
  equityFeedId: string | null;
}

solanaAssetsRouter.get("/", async (_req, res) => {
  const cached = getCached<SolanaAssetList>(CACHE_KEY);
  if (cached) {
    const body: ApiResponse<SolanaAssetList> = { ok: true, data: cached };
    res.status(200).json(body);
    return;
  }

  try {
    // Step 1: resolve feed ids for every tracked symbol, in parallel.
    // Any single symbol's resolution failing doesn't fail the others.
    const resolutions = await Promise.allSettled(
      TRACKED_XSTOCK_SYMBOLS.map(async (s): Promise<ResolvedSymbol> => {
        const [xstockFeed, equityFeed] = await Promise.all([
          findFeedId(s.xstockSymbol, "crypto"),
          findFeedId(s.equitySymbol, "equity")
        ]);
        return {
          xstockSymbol: s.xstockSymbol,
          underlyingSymbol: s.equitySymbol,
          label: s.label,
          xstockFeedId: xstockFeed?.id ?? null,
          equityFeedId: equityFeed?.id ?? null
        };
      })
    );

    const resolved = resolutions
      .filter((r): r is PromiseFulfilledResult<ResolvedSymbol> => r.status === "fulfilled")
      .map((r) => r.value);

    // Step 2: batch-fetch every resolved feed id's price in one request.
    const allFeedIds = resolved
      .flatMap((r) => [r.xstockFeedId, r.equityFeedId])
      .filter((id): id is string => id !== null);

    const prices = await getLatestPrices(allFeedIds);

    // Step 2b: real on-chain read. For every symbol with a verified mint
    // address (Session 11), fetch its live supply directly from Solana —
    // independent of Pyth, and independent of whether Pyth resolved
    // anything for that symbol.
    const supplyResults = await Promise.allSettled(
      TRACKED_XSTOCK_SYMBOLS.map(async (s) => {
        const mint = XSTOCK_SOLANA_MINTS[s.xstockSymbol] ?? null;
        const supply = mint ? await getTokenSupply(mint) : null;
        return { symbol: s.xstockSymbol, mint, supply };
      })
    );
    const supplyBySymbol = new Map<
      string,
      { symbol: string; mint: string | null; supply: { uiAmount: number | null } | null }
    >();
    for (const r of supplyResults) {
      if (r.status === "fulfilled") {
        supplyBySymbol.set(r.value.symbol, r.value);
      }
    }

    // Step 3: assemble the comparison, skipping symbols where neither
    // side resolved rather than showing an empty row.
    const assets: SolanaTokenizedAsset[] = resolved
      .map((r): SolanaTokenizedAsset | null => {
        const xstockPrice = r.xstockFeedId ? prices[r.xstockFeedId] : undefined;
        const equityPrice = r.equityFeedId ? prices[r.equityFeedId] : undefined;
        const onchain = supplyBySymbol.get(r.xstockSymbol);

        if (!xstockPrice && !equityPrice && !onchain?.mint) return null;

        const pegRatio =
          xstockPrice && equityPrice
            ? Number((xstockPrice.priceUsd / equityPrice.priceUsd).toFixed(4))
            : null;

        return {
          xstockSymbol: r.xstockSymbol,
          underlyingSymbol: r.underlyingSymbol,
          label: r.label,
          xstockFeedId: r.xstockFeedId,
          equityFeedId: r.equityFeedId,
          xstockPriceUsd: xstockPrice?.priceUsd ?? null,
          equityPriceUsd: equityPrice?.priceUsd ?? null,
          pegRatio,
          publishedAt: xstockPrice?.publishedAt ?? equityPrice?.publishedAt ?? null,
          mintAddress: onchain?.mint ?? null,
          explorerUrl: onchain?.mint ? buildSolscanUrl(onchain.mint) : null,
          onchainSupplyUi: onchain?.supply?.uiAmount ?? null
        };
      })
      .filter((a): a is SolanaTokenizedAsset => a !== null);

    if (assets.length === 0) {
      const body: ApiResponse<SolanaAssetList> = {
        ok: false,
        error:
          "Nothing resolved for any tracked xStock symbol — no Pyth price and no on-chain Solana data. Check PYTH_API_KEY is set, and that the Solana RPC endpoint is reachable. Run `pnpm verify` in apps/api for a clearer breakdown."
      };
      res.status(200).json(body);
      return;
    }

    const result: SolanaAssetList = { assets, fetchedAt: new Date().toISOString() };
    setCached(CACHE_KEY, result, CACHE_TTL_MS);

    const body: ApiResponse<SolanaAssetList> = { ok: true, data: result };
    res.status(200).json(body);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error fetching Solana asset data";
    const body: ApiResponse<SolanaAssetList> = { ok: false, error: message };
    res.status(502).json(body);
  }
});
