# BEJ-103 Manual Trial Creation

## Purpose

These documents replace the earlier monolithic conversational plan for
BEJ-103 (`create trials`) with small implementation gates that can be reviewed
and approved independently. Future BEJ-103 implementation pull requests must
reference this planning set and identify the single gate they implement.

Creating or changing these planning documents does not approve any
implementation gate. Passing a gate's validation also does not authorize work
on the next gate.

## Planning set

- [Event creation](./event-creation.md) defines the event workspace, manual
  event creation, and the persisted empty-event lifecycle.
- [Result creation R1](./result-creation.md) defines the manual-result schema,
  identity, transaction, error, date-only, and Server Action backend contract.
- [Result creation R2](./result-creation-r2.md) defines the full-page result
  form and admin UI workflow built on the approved R1 contract.
- [Later UX](./later-ux.md) records deferred ideas only and does not authorize
  their implementation.

Repository guardrails and current feature documentation:

- [Architecture guardrails](../../../ARCHITECTURE.md)
- [Documentation rules](../../documentation-rules.md)
- [Current admin trial management](../../features/admin-trial-management.md)
- [Koiratietokanta AJOK upsert](../../features/trials/koiratietokanta-api-ajok-upsert.md)

## Grounded current state

- The admin trials page is an event-first master-detail flow backed by
  canonical `TrialEvent` and `TrialEntry` rows.
- Admin event metadata and existing result rows can currently be edited, and
  existing result rows can be deleted. The current feature documentation still
  describes an older read-only state and must be updated when an implementation
  slice changes durable feature behavior.
- Admin event searches include persisted events even when they have no entries.
- Public trial search explicitly requires an event to have at least one entry,
  and public trial detail returns no result for an empty event.
- Deleting the final `TrialEntry` currently deletes its `TrialEvent` in the
  same transaction. [Event creation](./event-creation.md) defines the planned
  replacement lifecycle.
- Koiratietokanta ingestion currently resolves a `TrialEvent` by
  `sklKoeId`, resolves a result within that event by registration snapshot,
  and writes a source-derived `yksilointiAvain` in
  `SKL:<sklKoeId>|REG:<registration>` form.

## Accepted target direction

- Manual creation is event-first and page-based.
- A manually created event requires an SKL trial ID, event date, and place.
- An empty event is valid persisted admin-only state, not a separate draft
  state.
- Manual result entry starts with a typed registration number. The write path
  links an existing dog when the normalized registration resolves locally and
  otherwise permits an unlinked result.
- Manual results use identity compatible with Koiratietokanta ingestion. A
  later matching Koiratietokanta upsert becomes authoritative.
- Results are saved one dog at a time. The intended continuation supports both
  adding another result to the same event and finishing at the event workspace.
- The existing trials master-detail list and existing result-edit modal remain
  in place for BEJ-103.

## Implementation order and review rules

Implement gates in this order:

```text
E1
 ↓
E2
 ↓
R1 (backend)
 ↓
R2 (UI)
```

1. `E1` - event workspace
2. `E2` - event creation and empty-event lifecycle
3. `R1` - manual result schema and backend
4. `R2` - manual result UI and workflow

For every gate:

- Approve the gate explicitly before implementation begins.
- Implement only that gate's stated scope.
- Run its targeted validation and report the actual results.
- Review the behavior and documentation diff before approving another gate.
- Stop after the review; approval of one gate does not imply approval of the
  next gate.
- If review changes a product or architecture decision, update these planning
  documents before implementation continues.

## Non-goals

BEJ-103 does not authorize:

- changes to the public trial UI;
- changes to trial statistics or their calculation;
- redesign of legacy import or Koiratietokanta ingestion;
- redesign of existing result editing;
- batch entry of several unsaved dog results;
- a draft/publish workflow;
- autosave;
- reconciliation or conflict-resolution UI.

Potential future UX work is recorded in [Later UX](./later-ux.md) without
implementation authorization.
