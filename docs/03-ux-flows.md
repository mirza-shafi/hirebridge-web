# UX Flows

> The four flows that define the product. Everything else is CRUD.
> Last updated 2026-09-28.

## Principles

1. **Show the work.** Every AI output states what it was built from. A score shows its evidence;
   a rewritten bullet shows its source fact. Opacity is the fastest way to lose a recruiter.
2. **The user approves, the AI proposes.** No generated artifact leaves the product without an
   explicit human action.
3. **Waiting is a designed state.** 15–90 second operations get named steps and a page the user
   can leave and return to, never a modal spinner that traps them.
4. **Never hide a person.** No screen removes an applicant from view based on a score.
5. **Reversible by default.** Stage changes, approvals, and deletes are undoable or clearly
   warned. Hiring decisions are consequential for someone.

---

## Flow 1 — Candidate onboarding

```
sign up ──▶ upload CV ──▶ [parse run 20-40s] ──▶ review parsed facts ──▶ preferences ──▶ dashboard
                │                                        │
         "start from scratch"                    low-confidence fields
                │                                  flagged for confirm
                ▼                                        │
         manual profile builder ─────────────────────────┘
```

**The pivotal step is fact review.** Everything downstream — tailoring quality, ranking accuracy,
interview relevance — is bounded by profile quality. So:

- Present parsed facts as editable cards grouped by kind, not as a wall of form fields.
- Highlight `confidence < 0.7` fields and ask for confirmation explicitly.
- Show the source snippet from the CV next to anything uncertain.
- Never let this be skipped with a "do it later" — but do let it be *saved partially* and resumed.

**Failure paths.** Unparseable file (scanned image) → offer OCR, then manual entry, never a dead
end. Parse returns very few facts → say so plainly ("we only found 3 items — your CV may be a
scanned image") rather than presenting a sparse profile as complete.

---

## Flow 2 — Apply with a tailored CV ⭐

```
job page ──▶ Apply ──▶ choose base CV ──▶ [tailor run]
                                              │
                          ┌───────────────────┼───────────────────┐
                          ▼                   ▼                   ▼
                    validator passed   passed_with_warnings   validator failed
                          │                   │                   │
                          ▼                   ▼                   ▼
                      diff view       diff + per-line ack     explain + retry
                          │                   │                   │
                          └────────┬──────────┘                   ▼
                                   ▼                        apply with base CV
                             approve ──▶ PDF ──▶ submit ──▶ confirmation
```

**Design notes**

- Tailoring starts *before* the user reaches the diff view; the wait is filled with named steps
  ("reading the job description" → "matching your experience" → "checking every claim against
  your profile"). The third step name is doing real trust work — say it explicitly.
- The diff summary bar leads with **"0 new claims added"**. That single line is the product's
  core promise made visible.
- Approve is a deliberate action with the consequence stated: "This version will be sent to
  {Company}."
- On validator failure, never leave the user stuck. Offer: retry, edit the profile to add the
  missing fact, or apply with the base CV unchanged.
- After submission, the candidate can always see exactly which version was sent.

**Guest apply.** Upload → parse → auto-create profile → apply. Lower quality, higher conversion.
Prompt account creation *after* submission, when the value is already delivered.

---

## Flow 3 — Mock interview

```
select job / paste JD ──▶ [question gen 15-30s] ──▶ ready screen ──▶ start
                                                                      │
                            ┌─────────────────────────────────────────┘
                            ▼
                    ┌──▶ question ──▶ answer ──▶ follow-up? ──┐
                    │                                 │       │
                    └─────────── next question ◀──────┘       │
                                                              ▼
                                                    complete ──▶ [eval 30-60s] ──▶ report
```

**Design notes**

- The ready screen sets expectations: number of questions, estimated time, "you can pause and
  resume", and that no feedback comes until the end.
- **No feedback during the session.** Not a hint, not a "good answer". It breaks the rehearsal
  and it corrupts the evaluation.
- Follow-ups are nested visually under their parent so the transcript reads as one exchange.
- Pause and resume must be lossless — the question set is frozen server-side, so a resumed
  session is the same interview, not a new one.
- Abandonment is expected. An abandoned session is saved and resumable for 7 days, and the
  dashboard surfaces it rather than burying it.
- Report delivery: while evaluation runs, show what is being assessed rather than a bare spinner.

**Report reading order** — designed so the useful part is not below the fold:
strengths first, then the highest-priority gap with a concrete action, then the per-question
detail for those who want it. Not a score dump at the top.

---

## Flow 4 — Employer screening ⭐

```
paste JD ──▶ [parse 10-20s] ──▶ review structured job ──▶ red flags? ──▶ publish
                                                              │
                                                    edit or dismiss each
                                                              │
                                                              ▼
                           applications arrive ──▶ Rank ──▶ [score all + justify top 25]
                                                              │
                                                              ▼
                                        ranked list (ALL applicants) ──▶ open candidate
                                                              │                  │
                                                              ▼                  ▼
                                                        compare 2-4        stage change
                                                                                 │
                                                                                 ▼
                                                                        audit-logged, named
```

**Design notes**

- The structured-job review step is where the employer learns the system actually understood
  their JD. Getting must/nice wrong here visibly poisons trust in the ranking later — make the
  must/nice split directly editable, inline.
- Red flags are framed as a service, not a scolding: "This phrasing may exclude qualified
  candidates and is unlawful in some markets."
- Ranking runs progressively; rows reorder as scores land. Show "ranked 240 of 412" rather than
  freezing the table.
- The justification sentence is in the row, not behind a click. A recruiter scanning 40 rows will
  not open 40 panels.
- Matched-requirement chips link to the exact CV line. This is the single feature most likely to
  convert a sceptical recruiter — they check two or three, find them accurate, and stop checking.
- **Sort by "Most recent" is always one click away.** A recruiter who can cheaply verify the
  ranking against raw order will trust the ranking more, not less.
- Stage changes are optimistic in the UI, with undo, and always attributed to a named user.

**What is deliberately absent:** any control that hides low-scoring applicants, any "auto-reject
below X" automation, any bulk-reject-by-score action. These would be the most requested features
and they are the ones that turn a sorting tool into a discrimination engine operating at scale.
If an employer asks, the answer is that the tool ranks and explains; rejecting is their decision,
made one person at a time.

---

## Waiting-state copy

| Operation | Steps shown |
|---|---|
| Parse CV | reading your CV → extracting experience → organizing your profile |
| Tailor CV | reading the job description → matching your experience → checking every claim against your profile |
| Generate questions | analyzing the role → reviewing your background → preparing questions |
| Evaluate interview | reviewing your answers → scoring against the role → writing your feedback |
| Rank applicants | reading {n} applications → scoring against requirements → writing explanations |

Step names are supplied by the API (`run.step`) and are already user-readable — the frontend maps
them to copy, it does not invent progress.

---

## Notification touchpoints (email, v1)

| Event | To | Content |
|---|---|---|
| Application received | candidate | Confirmation + which CV version was sent |
| Stage changed | candidate | Stage only. Never an AI score, never a ranking position |
| New applicants (daily digest) | recruiter | Count + top 3 with justification |
| Ranking complete | recruiter | Link to the ranked list |
| Interview report ready | candidate | Link to the report |

**A candidate is never shown their rank or score relative to other applicants.** It is not
actionable, it is not their business, and it invites disputes over a number they cannot verify.
