# Routes & Screens

> Every screen in v1: purpose, states, and the components that carry it.
> Last updated 2026-09-28.

## Route map

| Route | Audience | Render | Auth |
|---|---|---|---|
| `/` | all | Static | — |
| `/jobs` | all | ISR 60s | — |
| `/jobs/[slug]` | all | ISR 300s | — |
| `/companies/[slug]` | all | ISR 1h | — |
| `/r/[shareToken]` | link holder | SSR | — |
| `/sign-in`, `/sign-up` | all | Static | — |
| `/onboarding` | new user | Client | ✓ |
| `/app/dashboard` | candidate | Client | ✓ |
| `/app/profile` | candidate | Client | ✓ |
| `/app/resumes` | candidate | Client | ✓ |
| `/app/resumes/[id]` | candidate | Client | ✓ |
| `/app/resumes/[id]/tailor` | candidate | Client | ✓ |
| `/app/applications` | candidate | Client | ✓ |
| `/app/interviews` | candidate | Client | ✓ |
| `/app/interviews/[id]/session` | candidate | Client | ✓ |
| `/app/interviews/[id]/report` | candidate | Client | ✓ |
| `/hr/dashboard` | employer | Client | ✓ org |
| `/hr/jobs` | employer | Client | ✓ org |
| `/hr/jobs/new` | employer | Client | ✓ org |
| `/hr/jobs/[id]` | employer | Client | ✓ org |
| `/hr/jobs/[id]/applicants` | employer | Client | ✓ org |
| `/hr/jobs/[id]/compare` | employer | Client | ✓ org |
| `/hr/candidates/[applicationId]` | employer | Client | ✓ org |
| `/hr/settings/team` | employer | Client | ✓ org_admin |
| `/hr/settings/usage` | employer | Client | ✓ org_admin |

---

## Public

### `/` — Landing
Two distinct paths above the fold — "Find your next role" and "Hire faster" — because the
product genuinely has two audiences and a merged pitch serves neither. Candidate proof:
the diff view screenshot. Employer proof: the ranked list screenshot with a visible reason.

### `/jobs` — Job board
Server-rendered list; filters (`q`, `location`, `skills`, `seniority`, `work_mode`) live in
`searchParams` so every filtered view is linkable and crawlable.
States: results · empty ("no jobs match — clear filters") · loading skeleton rows.

### `/jobs/[slug]` — Job detail
**The SEO surface.** Full `JobPosting` JSON-LD, OG image, canonical URL, `validThrough` from
`closes_at`. Structured requirements rendered as must-have / nice-to-have groups. Sticky Apply
button.
Logged-out apply → sign-up with the job carried through the flow, landing back here.
Closed job: keep the page live with a clear "This role is closed" banner plus similar roles —
never 404 an indexed URL.

### `/r/[shareToken]` — Shared interview report
Read-only, `noindex`. Renders the report without any candidate account context. Revoked token →
a plain "this link is no longer active" page, not an error.

---

## Candidate

### `/onboarding`
Three steps, resumable, progress persisted server-side.
1. Upload CV (or "start from scratch")
2. **Review parsed facts** — the parser's output shown as editable cards; low-confidence fields
   highlighted for confirmation. This step is where profile quality is won or lost; do not
   make it skippable.
3. Preferences: target roles, location, work mode, open-to-work.

### `/app/dashboard`
Application pipeline counts, in-flight runs, the last interview score, and one suggested next
action. Empty state for a new user is a checklist, not an empty grid.

### `/app/profile`
Structured editor over `profile_facts`, grouped by kind, drag-to-reorder. Each fact shows its
source badge (`parsed` / `entered` / `edited`) and a confirm control for unverified parsed facts.
A completeness meter names *what is missing* ("add 2 more project descriptions") rather than
showing a bare percentage.

### `/app/resumes`
Base CV plus every tailored version, each labelled with its target job, date, and validator
status. Actions: download, duplicate, delete, "tailor to a new job".

### `/app/resumes/[id]/tailor` ⭐
The most important candidate screen.

**Flow:** pick a job (from HireBridge or paste a JD) → run starts → step-named progress →
diff view → approve → PDF.

Diff view: side-by-side on desktop, stacked with a toggle on mobile. Per-line status badges
(`modified` / `reordered` / `removed` / `unchanged`). Expanding a modified line reveals the
source profile fact it derives from. A summary bar states counts and, explicitly, "0 new claims
added" — which is the reassurance the whole feature rests on.

Approve is disabled until any `passed_with_warnings` lines are individually acknowledged.
`validator_status: failed` renders an explanation and a retry, never a PDF.

States: selecting job · running (steps) · diff ready · warnings pending · failed · approved.

### `/app/applications`
Table with stage chips and timeline per application. Shows which resume version was sent — the
recruiter and the candidate must be looking at the same document.

### `/app/interviews` and `/app/interviews/[id]/session`
Start a session from a job or a pasted JD; mode selector (text in v1, voice disabled with a
"coming soon" label rather than hidden).

Session screen: chat-style, one question at a time, question counter and competency label,
elapsed timer, streaming interviewer text, answer box with a soft word-count hint. A follow-up
is visually nested under its parent question. Exit is always available and saves state —
`status: abandoned` is recoverable, and the frozen question set makes resuming exact.
Never show scores or hints during the session.

### `/app/interviews/[id]/report`
Overall score, competency radar (or bars — decide once, in `04-design-system.md`), strengths,
gaps, then per-question review with the candidate's own answer, the evidence quote the evaluator
used, and a stronger rewrite built only from what they actually said. Suggestions ordered by
priority, each with a concrete action. Share and PDF actions.

---

## Employer

### `/hr/jobs/new`
Single textarea: paste the JD. Parse run → editable structured preview (title, seniority,
must/nice skills, years, location, salary). **Red-flag panel** surfaces discriminatory phrasing
found by the parser; publish stays blocked until each flag is edited or explicitly dismissed
with a reason.

### `/hr/jobs/[id]/applicants` ⭐
The most important employer screen.

Header: total applicants, stage counts, "Rank applicants" action (or last-ranked timestamp).
Sort control: **Rank | Most recent** — always both, one click apart.
Stage tabs: All · New · Shortlisted · Interview · Offer · Rejected.

Row: score badge with the composite, candidate headline and years, the justification sentence,
matched-requirement chips, missing must-haves in muted text, stage control, quick note.
Hovering a matched chip highlights the CV line it cites.

**There is no score threshold filter, and there will not be one.** The list shows every
applicant; ranking changes order only. During a rank run, rows reorder progressively as scores
land, with a subtle transition rather than a full-page reload.

States: no applicants (share-job empty state) · unranked · ranking in progress · ranked ·
rank failed (order falls back to recency, with a banner).

### `/hr/candidates/[applicationId]`
Rendered CV alongside the score breakdown (lexical / semantic / rules with the weights used),
matched and missing requirements, the full justification, internal notes, stage history with
named actors, and the interview report if one exists. Every stage change requires a named user
and is written to the audit trail.

### `/hr/jobs/[id]/compare`
2–4 candidates side by side on a shared attribute grid: years, matched must-haves, missing,
sub-scores, interview score. Attribute rows align across columns; a missing value renders as an
explicit "not found in CV", never blank.

### `/hr/settings/usage`
Tokens and cost this period, quota remaining, and per-agent breakdown. Employers who can see
what the AI costs trust it more, and it is the screen that makes a plan upgrade self-evident.

---

## Cross-cutting components

| Component | Used by |
|---|---|
| `AsyncRunStatus` | every AI action — step name, progress, cancel |
| `RunTray` | layout-level tracker for in-flight runs across routes |
| `ScoreBadge` | applicant row, compare, candidate detail |
| `EvidenceChip` | justification → CV line link |
| `DiffLine` | resume diff |
| `FactCard` | profile editor, onboarding review |
| `StageSelect` | applicant row, candidate detail |
| `EmptyState` | every list |
| `FileDrop` | CV upload, logo upload |

## Screen state checklist

No screen is done until all five exist: **loading · empty · error · partial (some data, a failed
run) · success**. The partial state is the one that gets skipped and the one users hit most —
a ranked list where justification generation failed still has to render usable rows.
