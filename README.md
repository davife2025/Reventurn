# Reventurn

**See — and act on — where money earns the most in the world.**

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js%2014-000000?logo=next.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![X Layer](https://img.shields.io/badge/X%20Layer-EVM-6C5CE7)
![Solana](https://img.shields.io/badge/Solana-SPL-14F195?logo=solana&logoColor=black)
![Supabase](https://img.shields.io/badge/Supabase-Auth-3ECF8E?logo=supabase&logoColor=white)

Interest rates diverge across currencies every day — right now, Yuan
deposits are out-yielding dollar deposits, and USD borrowing costs are
climbing. Almost nobody outside an institutional trading desk can see
that gap easily, let alone act on it. Reventurn makes it visible, and
pairs it with live, on-chain access to the tokenized assets it points
toward — on two chains.

Built as a series of scoped, individually-verified sessions rather than
one large push. `SESSION_REPORT.md` is the running log of exactly what
was built, what was verified, what was deliberately left out, and why —
it's the single source of truth for this repo's actual state, and worth
reading before assuming anything exists that isn't in it.

## What's actually live

- **Global rate comparison** — real-time USD, EUR, JPY, and CNY policy
  rates from FRED, normalized and compared, with the current spread
  between the highest- and lowest-yielding currency highlighted.
- **Tokenized stocks on X Layer** — live xStocks data via OKX's Market
  API. Contract addresses are resolved live, not hardcoded, and link
  straight to X Layer's own block explorer.
- **Tokenized stocks on Solana** — the same xStocks, priced live via
  Pyth Network, *and* read directly on-chain: real SPL mint addresses
  (sourced from Solana Foundation's own published case study) queried
  live via `getTokenSupply` over Solana RPC. Two independent data
  sources, so one going down doesn't take out the other.
- **Goal-based allocation planner** — set a target annual return, see a
  blend of today's real currency rates that gets you there. Pure
  computation on real data; not a prediction, not investment advice.
- **Outbound execution** — links to OKX DEX and Jupiter, where trades
  actually settle. Reventurn is the visibility and decision-support
  layer; execution happens on infrastructure that's already audited and
  already trusted, not a trading engine built from scratch under a
  hackathon deadline.
- **Reventurn AI** — a chat assistant (Kimi K2 via Hugging Face) that
  answers questions about the product, grounded in what's actually built
  so it doesn't improvise features that don't exist.
- **Auth** — Supabase-backed sign-up/sign-in.

Explicitly **not** built, on purpose, not by accident: inflation-adjusted
real yield, rate alerts, historical persistence, and any actual on-chain
trade execution or custody. Each is discussed in `SESSION_REPORT.md`
with the reasoning for leaving it out.

## Why this belongs on both chains

X Layer and Solana both host live xStocks today. The product's actual
thesis — money should move to wherever it's treated best — extends
naturally from *which currency* to *which chain* gives the better access
to the same tokenized asset. That's one coherent product with two chain
integrations, not two unrelated hackathon submissions bolted together.

## Architecture

```
apps/
  web/       Next.js 14 (App Router) — server-rendered, one client
             component (the chat widget + allocation planner)
  api/       Express + TypeScript — proxies every external API so no
             third-party key ever reaches the browser
packages/
  types/     Shared TypeScript types, one source of truth for every
             API response shape used by both apps
  ui/        Shared React primitives (Button, Wordmark), built on
             class-variance-authority + tailwind-merge
  config/    Shared tsconfig + eslint preset
```

A page load fetches `/health`, `/rates`, `/assets`, and `/assets/solana`
from `apps/api` in parallel; each route checks an in-memory cache before
calling out to FRED, OKX, Pyth, or Solana RPC. Everything renders
server-side — there's no client-side loading spinner for this data, you
either get the finished page or a clear "unreachable" state.

## Tech stack

Next.js 14 · Express · TypeScript (strict) · Tailwind CSS · Supabase Auth
· pnpm workspaces + Turborepo · FRED API · OKX Market API · Pyth Network
· Solana RPC · Hugging Face Inference (Kimi K2)

## Prerequisites

- Node.js >= 20
- pnpm 9.x (`corepack enable && corepack prepare pnpm@9 --activate`)
- A Supabase project (free tier is fine)
- API keys: FRED (free), OKX Web3 (free tier), Pyth (free trial, paid
  for ongoing use), Hugging Face (paid beyond a small free tier) — see
  `apps/api/.env.example` for where to get each one

## Setup

```bash
pnpm install

cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
# fill in every key — see apps/api/.env.example for signup links
```

Supabase keys, from your project's Settings → API:

- `apps/web/.env.local` → `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `apps/api/.env` → `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

## Run

```bash
pnpm dev          # apps/web (:3000) and apps/api (:4000) together
```

## Verify

```bash
pnpm typecheck && pnpm build     # from the repo root

cd apps/api && pnpm verify       # confirms FRED, OKX, Pyth, and Solana
                                  # RPC are all actually reachable with
                                  # your real credentials — run this
                                  # before recording any demo
```

## More

- `SUBMISSION.md` — the hackathon writeup (pitch, track, judging-criteria mapping)
- `DEMO_SCRIPT.md` — timed walkthrough for the demo video
- `SESSION_REPORT.md` — the full build log; what's verified, what isn't, and why

## Disclaimer

Reventurn shows live public rate and market data for informational
purposes only. Nothing here is financial advice. Rates shown are
nominal, not adjusted for inflation. The allocation planner performs a
mathematical blend of observed data — it does not predict returns.

## License

MIT
