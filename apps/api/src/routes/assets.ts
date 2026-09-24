import { Router } from "express";
import type {
  ApiResponse,
  TokenizedAsset,
  TokenizedAssetList
} from "@reventurn/types";
import { okxGet } from "../lib/okx-client";
import {
  X_LAYER_CHAIN_INDEX,
  OKX_RWA_ISSUER_XSTOCKS,
  OKX_RWA_CATEGORY_ALL,
  buildExplorerTokenUrl
} from "../lib/xlayer-config";
import { getCached, setCached } from "../lib/cache";

export const assetsRouter = Router();

const CACHE_KEY = "xlayer-xstocks";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes — prices move faster than rates

/** Raw shape of one item in OKX's RWA Token List response, per their docs. */
interface OkxRwaTokenRaw {
  chainIndex: string;
  issuer: string;
  tokenSymbol: string;
  tokenName: string;
  stockCode: string;
  tokenContractAddress: string;
  price: string;
  priceChange24H: string;
  stockPrice: string;
  tokenToAssetRatio: string;
  volume24h: string;
  marketCap: string;
  peRatioTTM: string;
}

interface OkxRwaTokenListResponse {
  cursor: string;
  list: OkxRwaTokenRaw[];
}

/** OKX returns "" for unavailable numeric fields — convert that to null rather than NaN. */
function toNumberOrNull(value: string | undefined): number | null {
  if (value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function normalize(raw: OkxRwaTokenRaw): TokenizedAsset {
  return {
    tokenSymbol: raw.tokenSymbol,
    tokenName: raw.tokenName,
    stockCode: raw.stockCode,
    tokenContractAddress: raw.tokenContractAddress,
    chainIndex: raw.chainIndex,
    explorerUrl: buildExplorerTokenUrl(raw.tokenContractAddress),
    issuer: raw.issuer,
    onchainPriceUsd: toNumberOrNull(raw.price),
    priceChange24hPercent: toNumberOrNull(raw.priceChange24H),
    stockPriceUsd: toNumberOrNull(raw.stockPrice),
    tokenToAssetRatio: toNumberOrNull(raw.tokenToAssetRatio),
    volume24hUsd: toNumberOrNull(raw.volume24h),
    marketCapUsd: toNumberOrNull(raw.marketCap),
    peRatioTTM: toNumberOrNull(raw.peRatioTTM)
  };
}

assetsRouter.get("/", async (_req, res) => {
  const cached = getCached<TokenizedAssetList>(CACHE_KEY);
  if (cached) {
    const body: ApiResponse<TokenizedAssetList> = { ok: true, data: cached };
    res.status(200).json(body);
    return;
  }

  try {
    const data = await okxGet<OkxRwaTokenListResponse>(
      "/api/v6/dex/market/rwa/tokens",
      {
        chainIndex: X_LAYER_CHAIN_INDEX,
        issuer: OKX_RWA_ISSUER_XSTOCKS,
        category: OKX_RWA_CATEGORY_ALL,
        limit: "20"
      }
    );

    const assets = (data.list ?? []).map(normalize);

    if (assets.length === 0) {
      // Not necessarily an error — but worth surfacing distinctly from a
      // hard failure, since we couldn't independently confirm X Layer
      // returns non-empty xStocks results before shipping this (OKX's own
      // docs example uses Ethereum, not X Layer). See SESSION_REPORT.md.
      const body: ApiResponse<TokenizedAssetList> = {
        ok: false,
        error:
          "OKX returned zero xStocks results for X Layer (chainIndex=196). The API call succeeded — this may mean no xStocks are currently indexed for this chain, or the filters need adjusting."
      };
      res.status(200).json(body);
      return;
    }

    const result: TokenizedAssetList = {
      assets,
      fetchedAt: new Date().toISOString()
    };

    setCached(CACHE_KEY, result, CACHE_TTL_MS);

    const body: ApiResponse<TokenizedAssetList> = { ok: true, data: result };
    res.status(200).json(body);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error fetching X Layer assets";
    const body: ApiResponse<TokenizedAssetList> = { ok: false, error: message };
    res.status(502).json(body);
  }
});
