import { Button, Wordmark } from "@reventurn/ui";
import type {
  ApiResponse,
  HealthStatus,
  RateComparison,
  TokenizedAssetList,
  SolanaAssetList
} from "@reventurn/types";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";
import { TickerRail } from "./components/TickerRail";
import { Footer } from "./components/Footer";
import { AllocationPlanner } from "./components/AllocationPlanner";

async function getJson<T>(path: string): Promise<ApiResponse<T> | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return null;

  try {
    const res = await fetch(`${apiUrl}${path}`, { cache: "no-store" });
    return (await res.json()) as ApiResponse<T>;
  } catch {
    return null;
  }
}

function SectionIcon({ path }: { path: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="text-amber-500">
      <path d={path} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const [health, rates, assets, solanaAssets] = await Promise.all([
    getJson<HealthStatus>("/health"),
    getJson<RateComparison>("/rates"),
    getJson<TokenizedAssetList>("/assets"),
    getJson<SolanaAssetList>("/assets/solana")
  ]);

  return (
    <div className="flex flex-col">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-16">
        <header className="flex flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <Wordmark href="/" withTagline />
            <div className="flex flex-col items-end gap-2">
              {user ? (
                <>
                  <span className="font-data text-xs text-graphite-400">
                    {user.email}
                  </span>
                  <form action={signOut}>
                    <Button type="submit" variant="secondary">
                      Sign out
                    </Button>
                  </form>
                </>
              ) : (
                <div className="flex gap-2">
                  <a href="/sign-in">
                    <Button variant="secondary">Sign in</Button>
                  </a>
                  <a href="/sign-up">
                    <Button variant="primary">Sign up</Button>
                  </a>
                </div>
              )}
            </div>
          </div>
          <TickerRail rates={rates?.ok ? rates.data : null} />
        </header>

        <section className="border-b border-graphite-800 pb-8">
          <h1 className="font-heading text-2xl font-medium leading-snug text-graphite-50 sm:text-3xl">
            See where money earns the most —
            <br className="hidden sm:block" /> and act on it.
          </h1>
          <p className="mt-3 max-w-xl text-sm text-graphite-400">
            Interest rates diverge across currencies every day, but almost
            nobody outside an institutional desk can see the gap easily.
            Reventurn makes it visible — and pairs it with live, on-chain
            access to the tokenized assets it points toward.
          </p>
        </section>

        <section className="rounded-lg border border-graphite-700 p-4">
          <h2 className="flex items-center gap-2 font-heading text-sm font-medium text-graphite-200">
            <SectionIcon path="M2 8h10M8 2v12" />
            Global policy rate comparison
          </h2>

          {rates?.ok ? (
            <>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[480px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-graphite-700 text-graphite-400">
                      <th className="py-2 font-normal">Currency</th>
                      <th className="py-2 font-normal">Series</th>
                      <th className="py-2 pr-1 text-right font-normal">Rate</th>
                      <th className="py-2 font-normal">As of</th>
                    </tr>
                  </thead>
                  <tbody className="font-data">
                    {rates.data.observations.map((obs) => (
                      <tr
                        key={obs.currency}
                        className="border-b border-graphite-800 align-top"
                      >
                        <td className="py-2 font-sans font-medium text-graphite-50">
                          {obs.currency}
                        </td>
                        <td className="py-2 font-sans text-graphite-400">
                          {obs.label}
                          <div className="mt-0.5 text-xs text-graphite-500">
                            {obs.sourceNote}
                          </div>
                        </td>
                        <td className="py-2 pr-1 text-right font-medium text-graphite-50 tabular-nums">
                          {obs.ratePercent.toFixed(2)}%
                        </td>
                        <td className="py-2 whitespace-nowrap text-graphite-400">
                          {obs.date}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {rates.data.spreadPercent !== null &&
                rates.data.highest &&
                rates.data.lowest && (
                  <p className="mt-4 font-data text-sm text-graphite-300">
                    Spread:{" "}
                    <span className="font-medium text-amber-400">
                      {rates.data.spreadPercent.toFixed(2)}pp
                    </span>{" "}
                    between {rates.data.highest.currency} (
                    {rates.data.highest.ratePercent.toFixed(2)}%) and{" "}
                    {rates.data.lowest.currency} (
                    {rates.data.lowest.ratePercent.toFixed(2)}%).
                  </p>
                )}

              <p className="mt-2 text-xs text-graphite-500">
                Fetched {new Date(rates.data.fetchedAt).toLocaleString()}.
                Nominal policy rates only — not yet adjusted for inflation.
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-graphite-300">
              {rates === null
                ? "apps/api unreachable — start it with `pnpm dev` and confirm FRED_API_KEY is set in apps/api/.env."
                : `Error: ${rates.error}`}
            </p>
          )}
        </section>

        <AllocationPlanner observations={rates?.ok ? rates.data.observations : []} />

        <section className="rounded-lg border border-graphite-700 p-4">
          <h2 className="flex items-center gap-2 font-heading text-sm font-medium text-graphite-200">
            <SectionIcon path="M2 12l4-6 3 3 5-7" />
            Tokenized US stocks — live on X Layer
          </h2>

          {assets?.ok ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-graphite-700 text-graphite-400">
                    <th className="py-2 font-normal">Token</th>
                    <th className="py-2 pr-1 text-right font-normal">
                      On-chain price
                    </th>
                    <th className="py-2 pr-1 text-right font-normal">
                      Stock price
                    </th>
                    <th className="py-2 font-normal">Contract (X Layer)</th>
                  </tr>
                </thead>
                <tbody className="font-data">
                  {assets.data.assets.map((asset) => (
                    <tr
                      key={asset.tokenContractAddress}
                      className="border-b border-graphite-800 align-top"
                    >
                      <td className="py-2 font-sans font-medium text-graphite-50">
                        {asset.tokenSymbol}
                      </td>
                      <td className="py-2 pr-1 text-right text-graphite-50 tabular-nums">
                        {asset.onchainPriceUsd !== null
                          ? `$${asset.onchainPriceUsd.toFixed(2)}`
                          : "—"}
                      </td>
                      <td className="py-2 pr-1 text-right text-graphite-300 tabular-nums">
                        {asset.stockPriceUsd !== null
                          ? `$${asset.stockPriceUsd.toFixed(2)}`
                          : "—"}
                      </td>
                      <td className="py-2">
                        <a
                          href={asset.explorerUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="whitespace-nowrap text-xs text-graphite-400 underline decoration-graphite-600 hover:text-amber-400"
                        >
                          {asset.tokenContractAddress}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-2 text-sm text-graphite-300">
              {assets === null
                ? "apps/api unreachable — start it with `pnpm dev` and confirm OKX_API_KEY/SECRET/PASSPHRASE are set."
                : `${assets.error}`}
            </p>
          )}

          <p className="mt-2 text-xs text-graphite-500">
            Contract addresses and prices are resolved live from OKX's Market
            API for X Layer (chainIndex 196) — nothing here is hardcoded.
          </p>
          <a
            href="https://www.okx.com/web3/dex-swap"
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-xs text-amber-400 underline decoration-amber-700 hover:text-amber-300"
          >
            Trade on OKX DEX &rarr;
          </a>
        </section>

        <section className="rounded-lg border border-graphite-700 p-4">
          <h2 className="flex items-center gap-2 font-heading text-sm font-medium text-graphite-200">
            <SectionIcon path="M2 7l5 5 3-3 4 4" />
            Same stocks, priced on Solana — via Pyth
          </h2>
          <p className="mt-1 text-xs text-graphite-500">
            The same tokenized-stock thesis, on a second chain: xStocks
            trade on Solana too. Prices come from Pyth, resolved live by
            symbol. Mint address and supply are read directly from Solana
            via RPC — genuine on-chain data, not just an off-chain price.
          </p>

          {solanaAssets?.ok ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-graphite-700 text-graphite-400">
                    <th className="py-2 font-normal">xStock</th>
                    <th className="py-2 pr-1 text-right font-normal">
                      Token price
                    </th>
                    <th className="py-2 pr-1 text-right font-normal">
                      Stock price
                    </th>
                    <th className="py-2 pr-1 text-right font-normal">Peg</th>
                    <th className="py-2 font-normal">Mint (Solana)</th>
                  </tr>
                </thead>
                <tbody className="font-data">
                  {solanaAssets.data.assets.map((asset) => (
                    <tr
                      key={asset.xstockSymbol}
                      className="border-b border-graphite-800 align-top"
                    >
                      <td className="py-2 font-sans font-medium text-graphite-50">
                        {asset.xstockSymbol}
                      </td>
                      <td className="py-2 pr-1 text-right text-graphite-50 tabular-nums">
                        {asset.xstockPriceUsd !== null
                          ? `$${asset.xstockPriceUsd.toFixed(2)}`
                          : "—"}
                      </td>
                      <td className="py-2 pr-1 text-right text-graphite-300 tabular-nums">
                        {asset.equityPriceUsd !== null
                          ? `$${asset.equityPriceUsd.toFixed(2)}`
                          : "—"}
                      </td>
                      <td className="py-2 pr-1 text-right text-graphite-400 tabular-nums">
                        {asset.pegRatio !== null ? asset.pegRatio.toFixed(3) : "—"}
                      </td>
                      <td className="py-2">
                        {asset.explorerUrl ? (
                          <a
                            href={asset.explorerUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="whitespace-nowrap text-xs text-graphite-400 underline decoration-graphite-600 hover:text-amber-400"
                          >
                            {asset.mintAddress}
                          </a>
                        ) : (
                          <span className="text-xs text-graphite-500">—</span>
                        )}
                        {asset.onchainSupplyUi !== null && (
                          <div className="mt-0.5 text-xs text-graphite-500">
                            supply: {asset.onchainSupplyUi.toLocaleString()}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-2 text-sm text-graphite-300">
              {solanaAssets === null
                ? "apps/api unreachable — start it with `pnpm dev` and confirm PYTH_API_KEY is set."
                : `${solanaAssets.error}`}
            </p>
          )}

          <p className="mt-2 text-xs text-graphite-500">
            Peg = token price ÷ real stock price. 1.000 means the on-chain
            token is trading exactly in line with the underlying share.
          </p>
          <a
            href="https://jup.ag/swap"
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-xs text-amber-400 underline decoration-amber-700 hover:text-amber-300"
          >
            Trade on Jupiter (Solana) &rarr;
          </a>
        </section>
      </main>
      <Footer health={health} />
    </div>
  );
}
