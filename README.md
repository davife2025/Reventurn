# Reventurn

A platform for seeing — and acting on — where money earns the most in the world.

This repo is built and maintained session-by-session against
`AGENT_BUILD_RULESET.md`. See `SESSION_REPORT.md` for the current state of
the codebase (file tree, schema, deps, env vars, endpoints, TODOs) — it is
the single source of truth for what exists. Nothing not listed there should
be assumed present.

## Structure

```
apps/
  web/       Next.js 14 (App Router) — apps/web/app
  api/       Express + TypeScript server — apps/api/src
packages/
  types/     Shared TypeScript types (@reventurn/types)
  ui/        Shared React primitives (@reventurn/ui)
  config/    Shared tsconfig + eslint preset (@reventurn/config)
```

## Prerequisites

- Node.js >= 20
- pnpm 9.x (`corepack enable && corepack prepare pnpm@9 --activate`)
- A Supabase project (free tier is fine)

## Setup

```bash
pnpm install

cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
# fill in Supabase URL + keys in both files (see below)
```

Supabase keys, from your project's Settings → API:

- `apps/web/.env.local` → `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon/public key — safe for the browser)
- `apps/api/.env` → `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (service role key — server only, never commit or expose)

## Run

```bash
pnpm dev          # runs apps/web (:3000) and apps/api (:4000) together via turbo
```

Or individually:

```bash
pnpm --filter @reventurn/web dev
pnpm --filter @reventurn/api dev
```

## Verify

```bash
pnpm typecheck
pnpm build
```

## Deploy

Not wired to a live target yet. `.github/workflows/ci.yml` runs install →
typecheck → build on every push; the deploy job is a stub pending
Vercel (web) / Railway or Render (api) project setup — see
`SESSION_REPORT.md` → Known stubs/TODOs.
