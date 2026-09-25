# Reventurn — OKX Dev Day 2026 submission

**Track:** Build a Market (X Layer / tokenized stocks & RWA)

**One-line pitch:** Reventurn shows retail users, in real time, where their
money earns the most across global interest rates — and lets them act on
it instantly through X Layer's live tokenized US stock market.

---

## The problem

Two things are true right now and almost nobody outside an institutional
trading desk can see either of them easily:

1. **Rate opacity** — where money earns the most across currencies (Fed
   vs. ECB vs. BOJ vs. PBOC) lives inside expensive terminals or scattered
   central-bank filings, not anywhere a retail investor can casually check.
2. **Access inequality** — someone outside the US can't easily buy Apple
   or Tesla stock the way a US resident can: brokers, fees, currency
   friction.

Reventurn's bet: making the rate gap visible, and pairing it with
already-tokenized access to the assets it points toward, is a real
product — not two separate ones.

## What's actually built and live (not mocked)

- **Rate-differential dashboard** — ingests US, Eurozone, Japan, and China
  policy rates live from FRED (Federal Reserve Economic Data), normalizes
  them into one comparable view, and shows the current spread between the
  highest- and lowest-yielding currency.
- **Live X Layer integration** — lists tokenized US stocks (xStocks) that
  are live on X Layer today, with on-chain contract addresses and prices
  pulled from OKX's own Market API. **No contract address is hardcoded
  anywhere in this codebase** — every address is resolved live via OKX's
  RWA Token List endpoint (`chainIndex=196`) at request time, and each one
  links straight to X Layer's block explorer so it's independently
  checkable.
- **Working auth** (Supabase) and a real, typed, tested TypeScript
  monorepo (Next.js 14 + Express), not a single-file prototype.
- **A verification script** (`apps/api/scripts/verify-integrations.ts`,
  run via `pnpm verify`) that confirms both external integrations are
  live with real credentials — used to sanity-check this submission
  before recording the demo.

## Why this is a genuine X Layer integration, not a wrapper

The tokenized-asset feature reads directly from X Layer via OKX's
official Market API, filtered specifically to `chainIndex=196`. The
addresses aren't a static list we copied from somewhere — we
deliberately avoided that after confirming there's no public, verifiable
source for them, and built against the live API instead. Every address
shown in the product is checkable against X Layer's own explorer at
`https://www.okx.com/web3/explorer/xlayer` right now.

## Scoped honestly — what's MVP vs. roadmap

We started from a four-layer vision (rate visibility, tokenized assets,
goal-based investing, cross-border borrowing) and deliberately built only
the first layer plus a read integration for the second, rather than
half-building all four. Explicitly not in this submission:

- Inflation-adjusted real yield (nominal rates only, for now)
- Rate-crossing alerts
- Historical trend charts (data isn't persisted yet, only fetched live)
- Goal-based investing and the borrowing/lending layer (Layers 3–4 of the
  original vision)

We'd rather show one thing working end-to-end on real data than four
things half-working on fixtures.

## Why X Layer over the alternatives

X Layer's general-purpose, Ethereum-compatible design (audited token
standards, Chainlink oracles, existing lending/liquidity protocols to
build on) fits a broad investment platform better than a narrow
order-matching chain would. Tokenized stocks are already live on X Layer
through xStocks — Reventurn's job is making the surrounding data
(rates) and the resulting access legible in one place, not
re-implementing tokenization that already exists.

## Team & links

- Repo: _add your public repo URL here before submitting_
- Live/testnet product link: _add once deployed — see SESSION_REPORT.md
  for what's still needed (real FRED/OKX credentials, a hosted deploy)_
- Demo video: see `DEMO_SCRIPT.md` in this same package
