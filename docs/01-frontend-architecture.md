# Frontend Architecture

> Next.js 15 App Router · TypeScript · Tailwind · shadcn/ui. Backend contract in
> `hirebridge-api/docs/04-api-contract.md`.
> Last updated 2026-09-28.

## 1. Core decisions

| Decision | Choice | Why |
|---|---|---|
| Framework | Next.js App Router | The public job board lives or dies on SEO; SSG/ISR is a requirement, not a preference |
| Rendering | Per route group (§3) | Public pages are static; dashboards are client-rendered — one app, two strategies |
| Data fetching | Server Components for public, TanStack Query for authed | Public pages need no hydration; dashboards need cache, retry, and optimistic updates |
| API client | Generated from OpenAPI (`openapi-typescript` + a thin fetch wrapper) | The backend schema is the contract; hand-written types drift |
| Auth | Clerk | Matches ADR-0002 — buy the part FastAPI does not give you |
| Forms | react-hook-form + zod | Zod schemas are shared with the generated API types |
| State | Server state in TanStack Query; UI state in local state or a small Zustand store | There is almost no true global client state in this product |
| Styling | Tailwind + shadcn/ui | Own the components; no runtime theme library |

**Hard rule:** no LLM call, no provider SDK, and no business rule in the web app. Route Handlers
exist only for auth callbacks, webhook receipt, and OG-image generation. Everything else proxies
to FastAPI. Splitting agent logic across two languages is the single worst outcome available here.

## 2. Structure

```
src/
  app/
    (public)/                   # SSG / ISR, no auth
      page.tsx                  # landing
      jobs/page.tsx             # board, filters in searchParams
      jobs/[slug]/page.tsx      # job detail — the SEO surface
      companies/[slug]/page.tsx
      r/[shareToken]/page.tsx   # public interview report
    (candidate)/app/            # authed, client-rendered
      dashboard/ profile/ resumes/ applications/ interviews/
    (employer)/hr/              # authed, org-scoped
      dashboard/ jobs/ candidates/ settings/
    (auth)/sign-in/ sign-up/ onboarding/
    api/                        # auth callbacks, webhooks, og images ONLY
    layout.tsx
  components/
    ui/                         # shadcn primitives
    shared/                     # cross-domain (EmptyState, AsyncRunStatus, FileDrop)
    candidate/ employer/ job/ interview/ resume/
  lib/
    api/                        # generated client + typed hooks
    auth/ hooks/ utils/ schemas/
  types/
```

**Route groups**, not subdomains: one deploy, one session, and a candidate who is also a
recruiter at their own company works without a second login.

## 3. Rendering strategy per route

| Route | Mode | Revalidate | Notes |
|---|---|---|---|
| `/` | Static | on deploy | |
| `/jobs` | ISR | 60 s | Filters via `searchParams`, server-rendered for crawlability |
| `/jobs/[slug]` | ISR + `generateStaticParams` for active jobs | 300 s | Full JSON-LD `JobPosting`, OG image, canonical URL |
| `/companies/[slug]` | ISR | 3600 s | |
| `/r/[shareToken]` | SSR | — | `noindex`; revocable token |
| `/app/**` | Client | — | `dynamic = 'force-dynamic'`, no prerender |
| `/hr/**` | Client | — | Same |

`/jobs/[slug]` is the growth engine. Every published job must emit valid `JobPosting`
structured data (title, hiringOrganization, datePosted, validThrough, employmentType,
jobLocation, baseSalary) or Google will not surface it in job search.

## 4. Data layer

```
components → typed hooks (lib/api/hooks) → generated client → FastAPI
```

- One hook per endpoint; components never call fetch directly.
- Query keys are structured: `['job', jobId, 'applications', { sort, stage }]`.
- `staleTime` 30 s on lists, 5 min on reference data, 0 for anything during an active run.
- Mutations invalidate by key prefix and use optimistic updates for stage changes and note
  additions — the two places latency is most visible to a recruiter.

**Auth.** Clerk middleware guards `/app/**` and `/hr/**`. The JWT is attached by a fetch
interceptor; a `401` triggers one refresh, then a redirect. Role and `org_id` come from the token
— never from client state, and never trusted for authorization (the API decides; the UI only
hides what it should not offer).

## 5. Long-running work — the central UI problem

Every AI action takes 15–90 seconds. The UI treats this as a first-class state, not a spinner.

```ts
const run = useAgentRun(runId);   // opens SSE to /v1/runs/{id}/events
// run.status: 'queued' | 'running' | 'succeeded' | 'failed'
// run.step:   'retrieving_profile' | 'generating' | 'validating'
// run.pct:    number
```

Rules:
1. **Named steps, not a spinner.** "Generating tailored CV… validating against your profile" —
   the step names come from the API and are already user-readable.
2. **Never block the page.** Runs continue server-side; the user can navigate away and come back.
   A dismissible run tray in the layout tracks in-flight work across routes.
3. **Resumable.** On mount, reconcile with `GET /v1/runs/{id}` before trusting SSE — a
   reconnecting client must not miss a terminal event fired while it was away.
4. **Token streaming** for interview answers only; everything else streams progress, not tokens.
5. **Failure is explicit.** `validator_status: failed` is not a generic error — it renders a
   specific explanation of what could not be verified and what the user can do.

## 6. Two screens that carry the product

### Resume diff (`/app/resumes/[id]/tailor`)
The trust surface for the whole candidate product. Side-by-side base vs tailored, line-level
status (`modified` / `reordered` / `removed`), and each modified line expandable to show the
source profile fact it came from. Approve is an explicit action; the PDF does not exist before it.
If any line is flagged `passed_with_warnings`, approve stays disabled until each is acknowledged.

### Ranked applicants (`/hr/jobs/[id]/applicants`)
The trust surface for the employer product. Ranked list, **every applicant present** — no filter
control that hides low scores, because the API has no such parameter. Each row shows composite
score, the justification sentence, matched requirements as chips linking to the CV line, and
missing must-haves. Sorting by `recent` must be one click away, so the recruiter can always
verify the ranking against raw order.

## 7. File upload

```
POST /v1/files/upload-url → signed URL → direct PUT to storage → POST /v1/resumes { file_id }
```
Never proxy file bytes through Next.js. Client-side validation (type, 10 MB) is a UX courtesy;
the API validates again. Upload progress, then parse-run progress, are two distinct states and
the UI shows them as such.

## 8. Performance budget

| Metric | Target | Applies to |
|---|---|---|
| LCP | < 2.0 s | `/jobs/[slug]` on 4G |
| CLS | < 0.1 | all |
| INP | < 200 ms | all |
| Route JS | < 180 KB gzipped | public routes |

- No client-side data fetching on public routes.
- `next/image` everywhere; company logos served in fixed aspect boxes to avoid CLS.
- `next/font` with a subset; no external font CDN.
- Heavy dashboard widgets (charts, PDF preview) are `next/dynamic` with `ssr: false`.
- Bangladesh traffic is mobile-heavy on variable networks — test on throttled 4G, not on a laptop.

## 9. Accessibility

WCAG 2.1 AA as the baseline, non-negotiable in three places: the interview session (keyboard-only
operation, live-region announcements for each new question), the resume diff (status conveyed by
text and icon, never colour alone), and all forms (label association, inline errors tied by
`aria-describedby`). Every interactive element reachable by keyboard with a visible focus ring.

## 10. Errors & empty states

- Route-level `error.tsx` and `not-found.tsx` per group.
- Every list has a designed empty state with the next action ("No applicants yet — share this job"),
  never a blank panel.
- Error copy names the thing that failed and what to do; `request_id` is shown in a collapsed
  detail block so a support message can reference it.

## 11. Testing

| Layer | Tool | Covers |
|---|---|---|
| Unit | Vitest | utils, schemas, formatters |
| Component | Testing Library | diff view, applicant row, interview turn |
| E2E | Playwright | upload → tailor → approve → apply; create job → rank → shortlist |
| Contract | Generated types in CI | build fails when the API schema changes incompatibly |
| Visual | Playwright screenshots on the two critical screens | diff view, applicant list |

MSW mocks the API in component tests, seeded from the same OpenAPI schema.
