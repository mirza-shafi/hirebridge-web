# HireBridge Web — Progress

> Execution tracker for this repo. Companion file: `hirebridge-api/PROGRESS.md`.
> **What** and **why** live in `docs/` — this file tracks only **where we are**.
> Last updated: 2026-09-28

## How to use

| Marker | Meaning |
|---|---|
| `[ ]` | pending |
| `[x]` | done |
| `[~]` | in progress |
| `[!]` | blocked — see the note beside it |

Rules: a task is only `[x]` when it is merged and working in staging, not when the code is written.
A phase does not start until the previous phase's **exit gate** is fully checked.
Adding a task mid-phase means removing one of equal size from the same phase.

Recount any time with:

```sh
echo "pending: $(grep -c '^- \[ \]' PROGRESS.md)  done: $(grep -c '^- \[x\]' PROGRESS.md)"
```

## Summary

| Phase | Tasks | Done | Pending |
|---|---:|---:|---:|
| Phase 0 — Foundation | 30 | 17 | 13 |
| Phase 1 — CV tailoring + HR ranking | 75 | 0 | 75 |
| Phase 2 — Interview Studio (text) | 22 | 0 | 22 |
| Phase 3 — Voice | 10 | 0 | 10 |
| Phase 4 — Distribution | 5 | 0 | 5 |
| Phase 5 — Commercial | 6 | 0 | 6 |
| Cross-cutting (ongoing — never marked done) | 11 | 0 | 11 |
| Blocked / needs a decision | 4 | 0 | 4 |
| **Total** | **163** | **17** | **146** |

**Current position: Phase 0 scaffolded — 17 done, 146 pending. Phase 0 is not closed until its exit gate passes (see below).**

---

## Phase 0 — Foundation

### Scaffold & tooling
- [x] `create-next-app` — App Router, TypeScript, Tailwind
- [x] ESLint + Prettier + strict `tsconfig`
- [x] Folder structure per `docs/01-frontend-architecture.md` §2
- [ ] shadcn/ui init + base component set
- [x] `next/font` with a subset, self-hosted (no external font CDN)
- [x] Vitest + Testing Library setup
- [x] Playwright setup
- [ ] MSW setup, seeded from the OpenAPI schema

### Design tokens
- [x] CSS variables on `:root` per `docs/04-design-system.md` §2
- [x] Dark theme variable overrides
- [x] Tailwind theme mapped to the tokens (no hardcoded hex in components)
- [ ] Type scale
- [x] Theme toggle + system preference detection

### API layer
- [x] `openapi-typescript` generation script
- [ ] Typed fetch wrapper with auth interceptor
- [ ] `401` → single refresh attempt, then redirect
- [x] TanStack Query provider + structured query-key convention
- [ ] Error boundary mapping RFC 9457 problem details to UI copy
- [ ] Contract check in CI — build fails on an incompatible schema change

### Auth & routing
- [x] Clerk provider + middleware
- [x] Route groups: `(public)`, `(candidate)`, `(employer)`, `(auth)`
- [x] Guards on `/app/**` and `/hr/**`
- [ ] Role-aware navigation (a user can be both a candidate and a recruiter)
- [ ] `/onboarding` redirect for incomplete profiles
- [ ] Root layout, candidate shell, employer shell

### CI/CD
- [x] GitHub Actions: lint + typecheck + test + build
- [ ] Vercel project linked, preview deploys on PR
- [ ] Sentry wired
- [x] `.env.example`

### Phase 0 exit gate
- [ ] A signed-in user sees data from an authenticated API call in staging

## Phase 1 — CV tailoring + HR ranking

### Async run UX (build before any screen that uses it)
- [ ] `useAgentRun` hook — SSE + reconciliation on mount
- [ ] `AsyncRunStatus` component: named step, progress, cancel
- [ ] `RunTray` — layout-level tracker for in-flight runs across routes
- [ ] Step-name → copy mapping per `docs/03-ux-flows.md`
- [ ] Reconnect handling — never miss a terminal event fired while away
- [ ] Runs continue server-side when the user navigates away

### Public pages (the SEO surface)
- [ ] `/` landing with two distinct audience paths
- [ ] `/jobs` board, filters in `searchParams`, server-rendered
- [ ] `/jobs/[slug]` detail with `generateStaticParams` + ISR
- [ ] `JobPosting` JSON-LD, validated in Google's Rich Results Test
- [ ] OG image generation per job
- [ ] Canonical URLs + `validThrough` from `closes_at`
- [ ] Closed jobs stay live with a banner — never 404 an indexed URL
- [ ] `sitemap.xml` + `robots.txt`
- [ ] `/companies/[slug]`

### Candidate — onboarding & profile
- [ ] `/onboarding` 3 steps, resumable, progress persisted
- [ ] `FileDrop` component with type + size validation
- [ ] Direct-to-storage upload (never proxy bytes through Next)
- [ ] Upload progress and parse-run progress as two distinct states
- [ ] Parsed-fact review step with `FactCard`, low-confidence highlighted
- [ ] Source snippet shown next to uncertain fields
- [ ] Unparseable file path → OCR offer → manual entry, never a dead end
- [ ] `/app/profile` structured editor, grouped by fact kind, drag-to-reorder
- [ ] Completeness meter naming what is missing, not a bare percentage
- [ ] `/app/dashboard` with a checklist empty state for new users

### Candidate — tailoring (the trust surface)
- [ ] `/app/resumes` list with validator status per version
- [ ] `/app/resumes/[id]/tailor` job picker + raw-JD paste
- [ ] `DiffLine` component with status badges
- [ ] Side-by-side diff on desktop, stacked with toggle on mobile
- [ ] Expandable line → source profile fact
- [ ] Summary bar leading with "0 new claims added"
- [ ] `passed_with_warnings` → per-line acknowledgement gate on approve
- [ ] `validator_status: failed` → explanation + 3 recovery options
- [ ] Approve action stating the consequence ("will be sent to {Company}")
- [ ] PDF download after approval only

### Candidate — applications
- [ ] `/app/applications` with stage chips and timeline
- [ ] Shows which resume version was sent
- [ ] Apply flow from a job page, logged-out path carried through sign-up
- [ ] Guest apply → parse → auto-profile → prompt account after submission

### Employer — jobs
- [ ] `/hr/jobs/new` single-textarea JD paste
- [ ] Structured job preview, must/nice split editable inline
- [ ] Red-flag panel, publish blocked until each is edited or dismissed
- [ ] `/hr/jobs` list with status and applicant counts
- [ ] `/hr/jobs/[id]` detail + stats

### Employer — ranking (the trust surface)
- [ ] `/hr/jobs/[id]/applicants` ranked list
- [ ] `ScoreBadge` — always numeric, never colour alone
- [ ] Justification sentence in the row, not behind a click
- [ ] `EvidenceChip` — matched requirement highlights the source CV line
- [ ] Missing must-haves shown in muted text
- [ ] Sort control: Rank | Most recent, always one click apart
- [ ] Stage tabs
- [ ] **No score-threshold filter control — deliberate**
- [ ] Progressive reorder during a rank run, subtle transition
- [ ] Rank-failed state → recency order with a banner
- [ ] `/hr/candidates/[applicationId]` — CV + score breakdown + weights
- [ ] Stage history with named actors
- [ ] `StageSelect` with optimistic update + undo toast
- [ ] `/hr/jobs/[id]/compare` — 2–4 side by side, aligned attribute rows
- [ ] Missing values render "not found in CV", never blank

### Employer — settings
- [ ] `/hr/settings/team` invites and roles
- [ ] `/hr/settings/usage` tokens, cost, quota, per-agent breakdown

### Shared components
- [ ] `EmptyState` for every list
- [ ] `ScoreBadge`
- [ ] `EvidenceChip`
- [ ] `DiffLine`
- [ ] `FactCard`
- [ ] `StageSelect`
- [ ] `FileDrop`
- [ ] Route-level `error.tsx` and `not-found.tsx` per group
- [ ] Error copy showing `request_id` in a collapsed detail block

### Phase 1 exit gate
- [ ] Every Phase 1 screen has all 5 states (loading, empty, error, partial, success)
- [ ] `/jobs/[slug]` passes Google Rich Results validation
- [ ] LCP under 2.0 s on throttled 4G
- [ ] E2E: upload → tailor → approve → apply
- [ ] E2E: create job → rank → shortlist

## Phase 2 — Interview Studio (text)

- [ ] `/app/interviews` list + start from job or pasted JD
- [ ] Mode selector, voice visibly disabled with "coming soon"
- [ ] Ready screen setting expectations (count, time, pause, no mid-session feedback)
- [ ] `/app/interviews/[id]/session` chat-style, one question at a time
- [ ] Question counter, competency label, elapsed timer
- [ ] Streaming interviewer text
- [ ] Answer box with a soft word-count hint
- [ ] Follow-ups visually nested under their parent question
- [ ] Exit always available, state saved
- [ ] Abandoned session surfaced on the dashboard, resumable
- [ ] No scores or hints anywhere during the session
- [ ] Evaluation waiting state showing what is being assessed
- [ ] `/app/interviews/[id]/report` — strengths first, then top gap, then detail
- [ ] `CompetencyBars` (bars, not a radar)
- [ ] Per-question review with the candidate's answer and the evidence quote
- [ ] Suggestions ordered by priority with concrete actions
- [ ] Share link + revoke
- [ ] `/r/[shareToken]` public read-only report, `noindex`
- [ ] Revoked token → plain "no longer active" page, not an error
- [ ] Report PDF download
- [ ] Keyboard-only operation of the session
- [ ] `aria-live` announcement for each new question

## Phase 3 — Voice

- [ ] Mic permission request flow with a clear explanation
- [ ] Recording consent UI before the session starts
- [ ] WebSocket client for the voice frame protocol
- [ ] Session state indicator (listening / thinking / speaking)
- [ ] Waveform or level meter during recording
- [ ] Barge-in support
- [ ] Network-drop recovery without losing session state
- [ ] Live transcript display with low-confidence marking
- [ ] Fallback to text mode when the mic is unavailable or denied
- [ ] Audio playback in the report, per turn

## Phase 4 — Distribution

- [ ] Company profile pages, employer-editable
- [ ] Candidate job-match feed (reverse ranking)
- [ ] Job alert preferences UI
- [ ] Cross-post UI for the employer's connected channels
- [ ] Saved jobs / saved searches

## Phase 5 — Commercial

- [ ] Pricing page
- [ ] Checkout flow (bKash / SSLCommerz / Stripe)
- [ ] Plan limit UI — quota remaining, upgrade prompts at the limit
- [ ] Billing settings and invoice history
- [ ] Data export UI
- [ ] Account deletion flow with a clear consequence statement

## Cross-cutting (ongoing — never marked done)

- [ ] Both themes tested on the diff view and the applicant list
- [ ] Contrast ≥ 4.5:1 body, ≥ 3:1 large text and borders, both themes
- [ ] Visible focus ring on every interactive element
- [ ] Status conveyed by text or icon in addition to colour, everywhere
- [ ] Form labels associated, errors linked by `aria-describedby`
- [ ] Dialogs trap focus and restore it on close
- [ ] Tables use real `<th>` with scope
- [ ] `prefers-reduced-motion` disables row-reorder animation
- [ ] Route JS under 180 KB gzipped on public routes
- [ ] Tested on throttled 4G, not on a laptop connection
- [ ] Visual regression screenshots on the two critical screens

## Blocked / needs a decision

- [ ] Confirm the design direction with a real screen before building the rest
- [ ] Decide the font family (Inter vs Geist)
- [ ] Decide whether guest apply ships in v1 (open question 3 in the product brief)
- [ ] Confirm the employer wants a full pipeline or the ranked list only
