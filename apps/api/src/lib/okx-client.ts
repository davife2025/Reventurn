import { createHmac } from "node:crypto";

/**
 * Client for OKX's Web3 "Onchain OS" Market API.
 *
 * Verified in Session 3 research directly from OKX's own developer docs
 * (web3.okx.com/onchainos/dev-docs), not assumed from memory:
 * - Base URL: https://web3.okx.com
 * - Auth headers: OK-ACCESS-KEY, OK-ACCESS-SIGN, OK-ACCESS-TIMESTAMP,
 *   OK-ACCESS-PASSPHRASE (OK-ACCESS-PROJECT is optional/endpoint-dependent).
 * - Signature: Base64(HMAC-SHA256(timestamp + METHOD + requestPath(+query) + body, secretKey))
 *   where timestamp is an ISO-8601 UTC string, e.g. "2020-12-08T09:08:57.715Z",
 *   and must be within 30 seconds of OKX's server clock.
 * - The docs' own examples use this exact header set for the RWA Token
 *   List endpoint this session calls.
 *
 * NOT verified: an actual live call against web3.okx.com from this build
 * session — that domain isn't reachable from this sandbox. The signing
 * function itself is exercised in isolation (pure crypto, no network) and
 * the route logic is smoke-tested against a mocked response built from
 * OKX's own documented example payload. First live-key test happens in a
 * real environment, same caveat as Session 2's FRED integration.
 */

const OKX_BASE_URL = "https://web3.okx.com";
const FETCH_TIMEOUT_MS = 8000;

interface OkxCredentials {
  apiKey: string;
  apiSecret: string;
  passphrase: string;
  /** Some endpoints require this; harmless to omit for ones that don't. */
  projectId?: string;
}

function getCredentials(): OkxCredentials {
  const apiKey = process.env.OKX_API_KEY;
  const apiSecret = process.env.OKX_API_SECRET;
  const passphrase = process.env.OKX_API_PASSPHRASE;
  const projectId = process.env.OKX_API_PROJECT_ID;

  if (!apiKey || !apiSecret || !passphrase) {
    throw new Error(
      "Missing OKX_API_KEY / OKX_API_SECRET / OKX_API_PASSPHRASE — check apps/api/.env against .env.example. Get credentials at https://web3.okx.com/onchainos/dev-portal"
    );
  }

  return { apiKey, apiSecret, passphrase, projectId };
}

/** Pure signing function — no network — so it can be unit-tested in isolation. */
export function signOkxRequest(
  secret: string,
  timestamp: string,
  method: "GET" | "POST",
  requestPathWithQuery: string,
  body: string
): string {
  const prehash = `${timestamp}${method}${requestPathWithQuery}${body}`;
  return createHmac("sha256", secret).update(prehash).digest("base64");
}

/**
 * Performs a signed GET request against the OKX Web3 Market API.
 * `path` must include the leading /api/... segment; `params` are appended
 * as the query string and included in the signature per OKX's spec.
 */
export async function okxGet<T>(
  path: string,
  params: Record<string, string | undefined> = {}
): Promise<T> {
  const creds = getCredentials();

  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, value);
  }
  const queryString = query.toString();
  const requestPath = queryString ? `${path}?${queryString}` : path;

  const timestamp = new Date().toISOString();
  const sign = signOkxRequest(
    creds.apiSecret,
    timestamp,
    "GET",
    requestPath,
    ""
  );

  const headers: Record<string, string> = {
    "OK-ACCESS-KEY": creds.apiKey,
    "OK-ACCESS-SIGN": sign,
    "OK-ACCESS-TIMESTAMP": timestamp,
    "OK-ACCESS-PASSPHRASE": creds.passphrase
  };
  if (creds.projectId) headers["OK-ACCESS-PROJECT"] = creds.projectId;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(`${OKX_BASE_URL}${requestPath}`, {
      method: "GET",
      headers,
      signal: controller.signal
    });

    const json = (await res.json()) as { code?: string; msg?: string; data?: T };

    if (!res.ok || (json.code && json.code !== "0")) {
      throw new Error(
        `OKX API error (${res.status}) code=${json.code ?? "?"}: ${json.msg ?? res.statusText}`
      );
    }

    return json.data as T;
  } finally {
    clearTimeout(timeout);
  }
}
