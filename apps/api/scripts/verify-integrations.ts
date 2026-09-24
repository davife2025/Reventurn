/**
 * Run this once you have real FRED_API_KEY / OKX_API_* credentials in
 * apps/api/.env — it's the fastest way to find out whether the two
 * external integrations actually work before you're staring at a broken
 * demo. Each check is real (not simulated): it calls fetchLatestFredObservation
 * and okxGet exactly as apps/api's own routes do, so a pass here means the
 * real /rates and /assets endpoints will have real data.
 *
 * This directly answers the single biggest open question flagged since
 * Session 2 (does FRED_API_KEY actually work?) and Session 3 (does OKX
 * return non-empty results for X Layer specifically, not just some chain?).
 *
 * Usage:
 *   cd apps/api
 *   pnpm verify
 */
import "dotenv/config";
import { fetchLatestFredObservation } from "../src/lib/fred";
import { okxGet } from "../src/lib/okx-client";
import { TRACKED_RATE_SERIES } from "../src/lib/rates-config";
import {
  X_LAYER_CHAIN_INDEX,
  OKX_RWA_ISSUER_XSTOCKS,
  OKX_RWA_CATEGORY_ALL
} from "../src/lib/xlayer-config";

interface OkxRwaTokenListResponse {
  cursor: string;
  list: Array<{ tokenSymbol: string; tokenContractAddress: string }>;
}

interface CheckResult {
  name: string;
  ok: boolean;
  detail: string;
}

const results: CheckResult[] = [];

function record(name: string, ok: boolean, detail: string) {
  results.push({ name, ok, detail });
  const icon = ok ? "PASS" : "FAIL";
  console.log(`[${icon}] ${name}`);
  console.log(`       ${detail}`);
}

async function checkFred(): Promise<void> {
  const name = "FRED — federal funds rate (FEDFUNDS)";
  try {
    const series = TRACKED_RATE_SERIES.find((s) => s.currency === "USD")!;
    const obs = await fetchLatestFredObservation(series.fredSeriesId);
    if (!obs) {
      record(
        name,
        false,
        "Request succeeded but FRED returned no usable observation (or the sentinel value '.'). Unexpected for FEDFUNDS specifically — check the series ID is still valid."
      );
      return;
    }
    record(
      name,
      true,
      `${obs.date}: ${obs.value}% — FRED_API_KEY works and real data is flowing.`
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    record(name, false, message);
  }
}

async function checkOkxAuthBaseline(): Promise<void> {
  // Deliberately queries Ethereum (chainIndex=1) as a control — this is
  // the exact chain OKX's own docs example uses, so a failure here means
  // the credentials/signing themselves are wrong, independent of anything
  // X-Layer-specific.
  const name = "OKX — credentials + signing (control: chainIndex=1, Ethereum)";
  try {
    const data = await okxGet<OkxRwaTokenListResponse>(
      "/api/v6/dex/market/rwa/tokens",
      {
        chainIndex: "1",
        issuer: OKX_RWA_ISSUER_XSTOCKS,
        category: OKX_RWA_CATEGORY_ALL,
        limit: "5"
      }
    );
    const count = data.list?.length ?? 0;
    if (count === 0) {
      record(
        name,
        false,
        "Request succeeded (auth is fine) but returned zero rows even for Ethereum, OKX's own documented example chain. Something beyond credentials is off — check issuer/category codes haven't changed."
      );
      return;
    }
    const example = data.list[0]?.tokenSymbol ?? "unknown";
    record(
      name,
      true,
      `Auth works — got ${count} token(s) back for Ethereum, e.g. ${example}. OKX_API_KEY/SECRET/PASSPHRASE are correctly configured.`
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    record(
      name,
      false,
      `${message} — if this fails, everything else OKX-related will too. Fix this first.`
    );
  }
}

async function checkOkxXLayer(): Promise<void> {
  // This is the one thing Session 3 could NOT verify from the sandbox:
  // whether X Layer specifically (as opposed to Ethereum) returns any
  // xStocks rows from this endpoint.
  const name = `OKX — xStocks on X Layer (chainIndex=${X_LAYER_CHAIN_INDEX}, the real target)`;
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
    const count = data.list?.length ?? 0;
    if (count === 0) {
      record(
        name,
        false,
        "Zero rows for X Layer. If the Ethereum control check above PASSED, this means X Layer specifically isn't indexed for this endpoint yet — this is the scenario flagged as a risk in SESSION_REPORT.md Session 3. Worth asking in OKX's developer Discord before assuming the product feature is broken."
      );
      return;
    }
    const symbols = data.list.map((t) => t.tokenSymbol).join(", ");
    record(
      name,
      true,
      `${count} token(s) live on X Layer: ${symbols}. The core "Build a Market" feature has real data — you're demo-ready on this front.`
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    record(name, false, message);
  }
}

async function main() {
  console.log("Reventurn integration check\n");

  await checkFred();
  console.log("");
  await checkOkxAuthBaseline();
  console.log("");
  await checkOkxXLayer();

  const passCount = results.filter((r) => r.ok).length;
  console.log(`\n${passCount}/${results.length} checks passed.`);

  if (passCount < results.length) {
    console.log(
      "\nNot demo-ready yet — see the FAIL detail lines above for what to fix."
    );
    process.exitCode = 1;
  } else {
    console.log("\nAll integrations confirmed live. Demo-ready on the data side.");
  }
}

main();
