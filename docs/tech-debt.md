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

## 2026-04-04 - Align show-definition visibility semantics

- Area: `ShowResultDefinition` reads, projections, and admin UI option building.
- Issue: The intended contract is that `isEnabled` controls whether a definition is active/fetchable and `isVisibleByDefault` only controls whether an enabled definition is shown by default, but parts of the current admin show projection still preserve historical values as a compatibility path.
- Impact: The flags are easy to misread as overlapping behavior, which makes future edits risk reintroducing hidden definitions into option lists or dropping historical values unexpectedly.
- Suggested fix: Normalize the active-read path so `isEnabled` is the primary gate for fetch/projection logic, keep `isVisibleByDefault` as UI-only default visibility, and document any historical-value compatibility behavior explicitly at the reader boundary.
- Trigger to revisit: Next change touching admin show projection, option building, or show-definition seed semantics.
- Ticket: BEJ-63 follow-up.

## 2026-03-29 - Clarify historical ShowResult migration artifacts

- Area: Prisma migration history and schema documentation.
- Issue: Runtime `ShowResult` model/path has been removed, but historical migration files still contain legacy `ShowResult` DDL by design.
- Impact: New contributors can misread old migration files as active runtime schema intent.
- Suggested fix: Add a short migration-history note/playbook entry that explicitly separates active schema from historical migration snapshots, and consider migration squashing once release cadence allows it.
- Trigger to revisit: Next migration-history cleanup/squash task.
- Ticket: BEJ-47 follow-up.

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

## 2026-04-14 - AJOK missing event/dog contract fields

- Area: AJOK future poytakirja event and dog field parity.
- Issue: `TrialResult`-based read model does not type event metadata (`sklKoeId`, `rotukoodi`, `jarjestaja`, `koemuoto`) or most dog identity snapshot fields required by the locked flow-gate contract.
- Impact: BEJ-79 schema rollout can drift from BEJ-78 contract unless these fields are implemented with explicit mapping rules.
- Suggested fix: In BEJ-79, add canonical `TrialEvent` and `TrialEntry` typed fields and map them from API/legacy sources with per-field tests against the BEJ-78 contract table.
- Trigger to revisit: BEJ-79 implementation kickoff and schema mapping PR review.
- Ticket: BEJ-79.

## 2026-04-14 - AJOK missing era/result/status contract fields

- Area: AJOK result/era/status read parity.
- Issue: Current read model lacks era-level timing/score fields and explicit status flags (`luopui`, `suljettu`, `keskeytetty`, `huomautusTeksti`) expected by the future poytakirja contract.
- Impact: Read-path switch readiness cannot be expanded beyond the BEJ-78 minimum set until these fields are typed and validated.
- Suggested fix: Implement missing result/status fields in BEJ-79 schema and BEJ-80 import mapping, then re-run BEJ-78 flow-gate tests with updated statuses.
- Trigger to revisit: BEJ-80 backfill/import mapping work and BEJ-82 read-switch preparation.
- Ticket: BEJ-80.

## 2026-04-14 - AJOK additional/conditions detail gap follow-up

- Area: AJOK lisatiedot and condition-detail completeness.
- Issue: `lisatiedotJson` remains outside typed read-path parity even after BEJ-82 moved `paljasMaa`, `lumikeli`, `rokotusOk`, and `tunnistusOk` into typed detail-read + gap evaluation.
- Impact: Additional-detail reporting and future PDF/structured rendering remain partial while `lisatiedotJson` is still raw-only.
- Suggested fix: Preserve and normalize lisätiedot into typed read adapters and update the gap catalog status for `lisatiedotJson` when canonical mapping is ready.
- Trigger to revisit: next AJOK additional-field parity task after BEJ-82.
- Ticket: BEJ-82.
