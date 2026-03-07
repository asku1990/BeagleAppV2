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
- Issue: Current copy is a placeholder baseline and does not represent final legal-approved wording.
- Impact: Compliance text may be incomplete; cookie inventory/retention/contact details can be inaccurate until verified in production.
- Suggested fix: Run legal review, validate exact Better Auth cookie names/attributes in production, and finalize retention/contact/controller sections.
- Trigger to revisit: Next compliance/legal pass or before broad production launch.
- Ticket: BEJ-30 follow-up.

## 2026-03-07 - Split trials DB repository by use-case

- Area: `packages/db/trials/repository.ts`
- Issue: The repository still combines search, event detail, and dog-profile queries in one large file.
- Impact: Harder to navigate and review; mapping and date/filter helper changes have wider blast radius.
- Suggested fix: Split into `trials/search/*`, `trials/details/*`, and `trials/dog/*` repositories and move shared helpers to `trials/core/*`.
- Trigger to revisit: Next BEJ trial-domain task that touches query/filter/date logic in this file.
- Ticket: BEJ-29 follow-up (create dedicated split task key).
