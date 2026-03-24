# Tech Debt

This document is the default place to record cleanup, follow-up fixes, and technical debt discovered during coding but not addressed in the current change.

## How to use

- Add an entry when work should be revisited later and the note would be useful beyond the current file.
- Prefer this document over relying on memory or leaving scattered long comments in code.
- Keep entries short and actionable.
- If the note only makes sense next to the touched code, a brief inline `TODO` / `FIXME` is acceptable. Add a ticket when possible.

## Entry template

Use this format for new entries:

```md
## YYYY-MM-DD - Short title

- Area:
- Issue:
- Impact:
- Suggested fix:
- Trigger to revisit:
- Ticket:
```

## Entries

## 2026-03-07 - Finalize privacy and consent legal details

- Area: Public privacy page and analytics consent flow (`/privacy`, footer links, consent banner).
- Issue: Privacy page now follows an interim Finnish template with verified contact email, but controller identifiers, postal details, and final legal wording still need authoritative verification.
- Impact: Compliance text is closer to publishable, but missing controller fields or unverified processing details can still leave the policy incomplete.
- Suggested fix: Run legal review, validate exact Better Auth cookie names/attributes in production, and replace the remaining placeholder controller details with approved values.
- Trigger to revisit: Next compliance/legal pass or before broad production launch.
- Ticket: BEJ-30 follow-up.

## 2026-03-07 - Split trials DB repository by use-case

- Area: `packages/db/trials/repository.ts`
- Issue: The repository still combines search, event detail, and dog-profile queries in one large file.
- Impact: Harder to navigate and review; mapping and date/filter helper changes have wider blast radius.
- Suggested fix: Split into `trials/search/*`, `trials/details/*`, and `trials/dog/*` repositories and move shared helpers to `trials/core/*`.
- Trigger to revisit: Next BEJ trial-domain task that touches query/filter/date logic in this file.
- Ticket: BEJ-29 follow-up (create dedicated split task key).

## 2026-03-18 - Expand canonical show presentation beyond single judge

- Area: Public show detail and dog-profile show presentation.
- Issue: Public show pages now use structured canonical result fields, but the event-level judge is still collapsed to a single string or `null` when multiple judges exist.
- Impact: Canonical result presentation is now cleaner, but events with multiple judges still lose detail at the event summary level.
- Suggested fix: Add explicit multi-judge support to the public show contract/UI instead of collapsing to one value.
- Trigger to revisit: Next public show UI/contract redesign or workbook-driven show presentation task.
- Ticket: BEJ-45 follow-up.
