# Design System

> Tailwind + shadcn/ui. Tokens first, components second.
> Last updated 2026-09-28.

## 1. Direction

Serious, quiet, and legible. This product handles someone's career and someone else's hiring
decision; it should read closer to a financial tool than to a consumer app. No gradients on
primary surfaces, no AI-sparkle motifs, no confetti.

Two audiences, one visual language, distinguished by accent and density:
- **Candidate** surfaces are more spacious, warmer, more encouraging in copy.
- **Employer** surfaces are denser, table-first, faster to scan.

## 2. Tokens

Defined as CSS variables on `:root`, redefined under a `.dark` selector. Never hardcode a hex
in a component.

```
--bg, --surface, --surface-raised, --border, --border-strong
--text, --text-muted, --text-subtle
--primary, --primary-fg
--success, --warning, --danger, --info   (+ -bg variants for chips)
--score-strong, --score-mid, --score-weak
```

**Colour rule:** score, diff status, and stage are never communicated by colour alone. Every one
carries a text label or an icon. This is an accessibility requirement and also a correctness one
— a recruiter screenshotting a list into a grayscale print must still read it.

## 3. Type

| Role | Size / weight |
|---|---|
| Display | 36 / 600 |
| H1 | 28 / 600 |
| H2 | 22 / 600 |
| H3 | 18 / 600 |
| Body | 15 / 400 |
| Small | 13 / 400 |
| Mono | 13 — used for `request_id`, fact IDs, score internals |

One sans family (Inter or Geist) via `next/font`, subset, self-hosted. One mono family.
Line-height 1.6 in body copy — CV and JD text is dense and gets read carefully.

## 4. Spacing & layout

4px base scale. Page gutter 16px mobile / 32px desktop. Max content width 1280px; reading
surfaces (job description, report narrative) capped at 72ch.

Density: candidate list rows 56px, employer table rows 48px. A recruiter fits more rows on
screen; a candidate is not scanning a hundred of anything.

## 5. Component inventory

**From shadcn/ui:** button, input, textarea, select, checkbox, radio, switch, dialog, sheet,
dropdown-menu, tabs, table, badge, card, tooltip, popover, toast, skeleton, progress,
separator, avatar, command.

**Built for HireBridge:**

| Component | Notes |
|---|---|
| `ScoreBadge` | Composite score; tier by threshold; always with a numeric value, never colour alone |
| `EvidenceChip` | Matched requirement → hover/click highlights the source CV line |
| `DiffLine` | Base/tailored pair with status badge and expandable source fact |
| `FactCard` | Editable profile fact with source badge and confidence indicator |
| `AsyncRunStatus` | Step name + progress + cancel; the single async primitive |
| `RunTray` | Layout-level in-flight run tracker |
| `StageSelect` | Stage change with optimistic update and undo toast |
| `CompetencyBars` | Interview competency scores (bars, not a radar — radars are hard to read at 5 axes and worse on mobile) |
| `EmptyState` | Icon, one line of explanation, one primary action |
| `FileDrop` | Drag/drop + browse, type and size validation, upload progress |

## 6. Motion

150–200 ms, `ease-out`. Motion is used for three things only: state transitions (skeleton →
content), reordering rows during a rank run, and toast entry. Everything respects
`prefers-reduced-motion`, which disables the row-reorder animation entirely rather than shortening it.

## 7. Writing

- Sentence case for every heading, label, and button.
- Buttons are verbs: "Approve and download", not "OK".
- Never anthropomorphize the system. "Checked against your profile", not "I checked your profile".
- Never state certainty the system does not have: "no Kubernetes experience found in this CV",
  not "not qualified".
- Errors name the failure and the next step. Show `request_id` in a collapsed detail block.
- Numbers are localized; salaries display with an explicit currency code.

## 8. Dark mode

Both themes are first-class from day one, not retrofitted. Test the two critical screens — the
resume diff and the ranked applicant list — in both, since both rely heavily on status colour
paired with text.

## 9. Accessibility checklist

- [ ] Contrast ≥ 4.5:1 for body, ≥ 3:1 for large text and UI borders, in both themes
- [ ] Visible focus ring on every interactive element
- [ ] Full keyboard operation of the interview session
- [ ] `aria-live` announcements for new interview questions and completed runs
- [ ] Status conveyed by text/icon in addition to colour, everywhere
- [ ] Form labels associated; errors linked by `aria-describedby`
- [ ] Dialogs trap focus and restore it on close
- [ ] Tables use real `<th>` with scope
