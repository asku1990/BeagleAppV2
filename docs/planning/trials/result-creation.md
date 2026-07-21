# BEJ-103 Result Creation

## Purpose

This plan adds one-at-a-time manual `TrialEntry` creation after the event
workspace and empty-event lifecycle are complete. It preserves the existing
result-edit modal. Cross-slice decisions and review rules are defined in the
[planning overview](./README.md), and event dependencies are defined in
[Event creation](./event-creation.md).

## Existing identity and upsert behavior

The current Koiratietokanta write path:

- resolves a `TrialEvent` through unique `TrialEvent.sklKoeId`;
- resolves an entry inside that event through the existing
  `TrialEvent` plus `TrialEntry.rekisterinumeroSnapshot` uniqueness;
- writes `TrialEntry.yksilointiAvain` as
  `SKL:<sklKoeId>|REG:<normalizedRegistration>`; and
- upserts the entry in place before replacing its era and lisatieto rows.

Manual result creation must use these existing identity semantics. This plan
does not add another database uniqueness constraint.

## Authoritative matching upsert

When a later Koiratietokanta payload has the same `TrialEvent.sklKoeId` and
normalized registration as a manually created result:

- the existing manual `TrialEntry` is updated in place;
- a duplicate result is not created;
- incoming Koiratietokanta result, era, lisatieto, snapshot, and event data
  become authoritative according to the existing ingestion mapper and upsert;
- `TrialEntry.lahde` changes to `KOIRATIETOKANTA_API`; and
- `dogId` is updated when the authoritative registration resolves through
  `DogRegistration`. If it does not resolve, the current upsert behavior
  preserves an existing dog link rather than clearing it.

This is automatic matching, not a reconciliation UI or import redesign.

## Gate R1: Manual result backend and schema foundation

### Scope

- Add `MANUAL_ADMIN` to the existing `TrialSourceTag` enum in an explicitly
  approved Prisma migration.
- Add admin manual-result request/response contracts, a server use-case, a
  focused transactional DB write, and a Server Action mutation path.
- Accept `trialEventId`, a registration number, and the existing entry, era,
  and lisatieto write shape used by result editing.
- Normalize and validate registration using existing server-side registration
  rules.
- Load the target event and require its `sklKoeId` for API-compatible manual
  identity.
- Reject a second result with the same normalized registration in the event.
- Resolve `dogId` through `DogRegistration`; save an unlinked entry when no
  local dog owns the normalized registration.
- Store `lahde=MANUAL_ADMIN`, the normalized
  `rekisterinumeroSnapshot`, and the API-compatible `yksilointiAvain`.
- Create the entry, eras, and lisatiedot atomically.
- Share validation and normalization with result update where doing so avoids
  divergent business rules, while keeping create and update as separate
  use-cases and DB writes.
- Add a regression test for the authoritative matching upsert described above.

### Exclusions

- No result-create UI or navigation changes.
- No existing result-editing redesign.
- No batch creation, autosave, draft/publish state, or reconciliation UI.
- No new ingestion endpoint or change to the external Koiratietokanta
  contract.
- No new database uniqueness constraint. The only planned schema change in
  this gate is the new source enum value.

### Dependencies

- E2 must be approved and merged so the target event and empty-event lifecycle
  exist.
- The `MANUAL_ADMIN` migration requires explicit schema-change approval before
  implementation.
- Existing registration normalization, admin authorization, structured
  logging, entry validation, and transaction conventions must be reused.

### Acceptance criteria

- An authorized call creates exactly one manual entry with its complete nested
  writes or creates nothing if the transaction fails.
- A matching local dog is linked; an unknown registration remains a valid
  unlinked result.
- Invalid registration, missing event, event without an SKL ID, duplicate
  event registration, and invalid entry/era/lisatieto data return stable errors.
- Manual source and identity fields match the documented API-compatible
  semantics.
- A later matching Koiratietokanta upsert updates the same entry without a
  duplicate and makes the incoming data authoritative.

### Targeted validation

- Migration/schema checks for the new enum value and regenerated Prisma client.
- DB tests for linked and unlinked creation, identity fields, duplicate
  rejection, nested writes, and rollback.
- Server tests for authorization, registration normalization, event
  validation, entry/era/lisatieto validation, conflict mapping, and logging.
- Server Action tests for authentication and service-result mapping.
- Existing Koiratietokanta DB/service tests plus a manual-to-API replacement
  regression case.
- Targeted type checking and linting for contracts, server, DB, and web action
  code; do not run cycle lint in the agent workflow.

### Merge independence and review gate

R1 can be merged safely after E2 without R2. The write path has no linked admin
UI yet, so it does not expose an unfinished user workflow. Its migration and
backend behavior must nevertheless be complete, documented, and validated.

Stop after validation and request explicit review. Do not begin R2 without
separate approval.

## Gate R2: Full-page manual result form

### Scope

- Add a dedicated full-page result-create route under one event workspace.
- Keep the event identity visible while entering a dog result.
- Add a required free-text registration field. Do not require selecting an
  existing dog.
- Reuse the existing result, era, lisatieto, judge, and note sections where
  practical, with one initial era and the existing validation semantics.
- Preserve entered values after server or validation failure and prevent
  duplicate submissions while a save is pending.
- Add two successful submission paths:
  - **Save and add another** creates one result, then opens a clean result form
    for the same event.
  - **Save and finish** creates one result, then returns to the event workspace.
- Change E2's temporary successful event-create continuation so the primary
  action opens the first result form for the newly persisted event.
- Define cancel and browser navigation:
  - Cancel returns to the event workspace.
  - Cancel asks for confirmation before discarding a dirty form.
  - Browser back follows the same dirty-form protection and otherwise returns
    to the event workspace.
  - A failed or rejected save stays on the populated form.
- Add Finnish and Swedish labels, helper text, errors, and success feedback.
- Keep existing result editing in its current modal.

### Exclusions

- No migration of existing result editing to a page.
- No searchable dog picker or inline dog creation.
- No batch form, autosave, draft/publish state, or reconciliation UI.
- No redesign of the existing trials master-detail list.
- No public UI or trial-statistics changes.

### Dependencies

- E1 and E2 must be merged for the workspace and persisted event lifecycle.
- R1 must be merged for the manual-result action and persistence contract.
- Existing entry form sections and form-model behavior are the reuse baseline;
  any extraction must preserve the current edit-modal behavior.

### Acceptance criteria

- Successful event creation continues to the first result form for that exact
  event.
- An admin can save a result for a known or unknown registration.
- Save and add another clears dog-specific state while retaining the event
  context and produces no duplicate submission.
- Save and finish returns to the event workspace where the new result appears.
- Cancel and browser back protect dirty input and return to the correct event
  when confirmed.
- Validation and server errors preserve entered data and provide actionable
  localized feedback.
- The existing result-edit modal behaves as before.

### Targeted validation

- Component/form-model tests for initial state, validation, dirty state,
  reset, and localized feedback.
- Mutation tests for success, failure, query invalidation, and duplicate-submit
  protection.
- Route/workflow tests for event-create continuation, add-another, finish,
  cancel, and browser-back handling.
- Regression tests for the existing result-edit modal and selected-event panel.
- Targeted web type checking and linting; do not run cycle lint in the agent
  workflow.
- Manual desktop and mobile checks for the long form and both continuation
  paths when browser tooling is available.

### Merge independence and review gate

R2 is the final BEJ-103 creation gate and can merge safely after E1, E2, and R1.
It replaces E2's documented temporary redirect with the final continuation
behavior and leaves no dependency on deferred UX work.

Stop after validation and request final BEJ-103 review. Deferred items remain
unauthorized unless they are moved into an approved planning gate.
