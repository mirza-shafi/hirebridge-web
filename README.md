# hirebridge-web

Frontend for HireBridge — Next.js 15 App Router, TypeScript, Tailwind, shadcn/ui.

## Progress

[`PROGRESS.md`](PROGRESS.md) — the task tracker. Start there to see what is done and what is next.

## Documentation

| Doc | Read it for |
|---|---|
| [`docs/00-product-brief.md`](docs/00-product-brief.md) | What we are building and why. **Start here.** |
| [`docs/01-frontend-architecture.md`](docs/01-frontend-architecture.md) | Rendering strategy, data layer, async run UX, performance budget |
| [`docs/02-routes-and-screens.md`](docs/02-routes-and-screens.md) | Every route and screen, with states |
| [`docs/03-ux-flows.md`](docs/03-ux-flows.md) | The four flows that define the product |
| [`docs/04-design-system.md`](docs/04-design-system.md) | Tokens, type, components, accessibility |
| [`docs/05-roadmap.md`](docs/05-roadmap.md) | Phases and exit criteria |
| [`docs/06-decisions.md`](docs/06-decisions.md) | ADRs |

`00`, `05`, and `06` are shared with `hirebridge-api/docs/`. Edit one, copy to the other in
the same commit.

## Rules that are not negotiable

1. No LLM call, provider SDK, or business rule in this app. Route Handlers are for auth
   callbacks, webhooks, and OG images only.
2. Public job pages are server-rendered with valid `JobPosting` structured data — that is the
   growth engine.
3. Nothing generated reaches a recruiter or a PDF without an explicit human approval action.
4. No UI control filters applicants by score. Ranking changes order only.
5. Every screen ships with five states: loading, empty, error, partial, success.

## Stack

Next.js 15 · TypeScript · Tailwind · shadcn/ui · TanStack Query · react-hook-form + zod ·
Clerk · generated OpenAPI client · Vitest + Testing Library + Playwright + MSW

## Status

Pre-Phase 0. Docs first, then the skeleton — see `docs/05-roadmap.md`.
