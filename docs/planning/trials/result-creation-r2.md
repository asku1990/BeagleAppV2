# BEJ-103 Gate R2 — Manual Result UI and Workflow

## Purpose

This plan adds the full-page admin workflow for creating one manual
`TrialEntry` at a time after Gate R1 has been implemented, validated, reviewed,
and approved. It preserves the existing result-edit modal and the trials
master-detail page.

Cross-slice decisions and review rules are defined in the
[planning overview](./README.md). Event dependencies are defined in
[Event creation](./event-creation.md), and the complete backend contract is
owned by [Gate R1](./result-creation.md).

## R1 contract assumed by R2

R2 consumes, but does not redefine or weaken, the R1 decisions for:

- Prisma schema and date-only storage;
- manual-result request and response contracts;
- backend service and DB transaction behavior;
- admin Server Action transport;
- canonical registration and identity;
- duplicate protection and `DogRegistration` resolution;
- stable backend error codes;
- authoritative Koiratietokanta replacement; and
- timezone-free `YYYY-MM-DD` event-date behavior.

R2 maps stable `errorCode` values to localized presentation and never inspects
backend message strings to determine behavior.
When R1 supplies typed validation details, R2 uses their stable reason and safe
field context to identify the rejected section or lisätieto row.

## Scope

- Add a dedicated full-page result-create route under one event workspace.
- Keep the event identity visible while entering a dog result.
- Add a required free-text registration field. Do not require selecting an
  existing dog.
- Reuse the existing result, era, lisatieto, judge, and note sections where
  practical, with one initial era and the existing validation semantics.
- Prefill each clean form with the event's chief-judge name and number. Keep
  all dog/result-specific values empty and the initial trial type `NORMAL`.
- Preserve entered values after server or validation failure and prevent
  duplicate submissions while a save is pending.
- Add a React Query mutation over the R1 Server Action. On success, invalidate
  and refetch the admin event/list and affected public trial queries. Do not
  optimistically insert a partial result into query caches.
- Add two successful submission paths:
  - **Save and add another** creates one result, shows localized success
    feedback, and opens a clean form for the same event with event-level judge
    defaults restored.
  - **Save and finish** creates one result, shows localized success feedback,
    and returns to the event workspace.
- Change E2's temporary successful event-create continuation so the primary
  action opens the first result form for the newly persisted event.
- Define cancel and browser navigation:
  - Cancel returns to the event workspace.
  - Dirty cancel uses a localized application confirmation dialog before
    discarding values.
  - Browser-back and internal navigation use a route-blocking application
    confirmation where technically supported.
  - Refresh and tab/window close use browser-native unsaved-change protection
    with browser-controlled wording.
  - Clean browser back returns to the event workspace without confirmation.
  - A failed or rejected save stays on the populated form.
- Add Finnish and Swedish labels, helper text, validation messages, stable
  backend-error mappings, and success/error feedback.
- Add the user-visible result-creation change under `CHANGELOG.md` Unreleased
  when R2 exposes the workflow.
- Keep existing result editing in its current modal.

## Error and validation presentation

- Client validation provides immediate field feedback but does not replace R1
  server validation or canonical normalization.
- `INVALID_REGISTRATION_NUMBER`, `INVALID_TRIAL_ENTRY`,
  `INVALID_TRIAL_ERAS`, and `INVALID_TRIAL_ADDITIONAL_INFO` keep the populated
  form open and show actionable localized validation feedback.
- `TRIAL_ENTRY_REGISTRATION_CONFLICT` explains that the canonical registration
  already exists in the selected event and keeps the form populated.
- `TRIAL_EVENT_NOT_FOUND` and `TRIAL_EVENT_MISSING_SKL_ID` show an event-level
  state with navigation back to the workspace or trials list as appropriate.
- `UNAUTHENTICATED` and `FORBIDDEN` continue through the existing admin access
  behavior.
- Unexpected failures keep the form populated and show localized generic error
  feedback.

## Exclusions

- No migration of existing result editing to a page.
- No searchable dog picker or inline dog creation.
- No batch form, autosave, draft/publish state, or reconciliation UI.
- No optimistic cache insertion.
- No redesign of the existing trials master-detail list.
- No public UI or trial-statistics changes.
- No changes to R1 identity, transaction, error, date-only, or authoritative
  upsert behavior.

## Dependencies

- E1 and E2 must be merged for the workspace and persisted event lifecycle.
- R1 must be merged and separately approved for its schema, contracts, Server
  Action, stable errors, and persistence behavior.
- Existing entry form sections and form-model behavior are the reuse baseline;
  any extraction must preserve the current edit-modal behavior.
- Existing admin trial query keys and localized message infrastructure are the
  integration points for invalidation and user feedback.

## Acceptance criteria

- Successful event creation continues to the first result form for that exact
  event.
- The event date is displayed from the R1 `YYYY-MM-DD` contract without client
  timezone reinterpretation.
- A clean form has one initial era, `NORMAL` trial type, and the event's
  chief-judge defaults.
- An admin can save a result for a known or unknown registration.
- Stable R1 error codes produce localized UI behavior without inspecting
  backend messages.
- Save and add another clears dog/result-specific state, restores event-level
  defaults, retains event context, and produces no duplicate submission.
- Save and finish returns to the event workspace where the invalidated event
  query reloads the new result.
- No partial result is inserted optimistically into admin or public caches.
- Cancel, browser back, refresh, and close protect dirty input using the
  documented native browser behavior.
- Validation and server errors preserve entered data and provide actionable
  Finnish and Swedish feedback.
- The existing result-edit modal behaves as before.
- The user-visible change is recorded under `CHANGELOG.md` Unreleased.

## Targeted validation

- Component/form-model tests for initial event-level defaults, validation,
  dirty state, reset, and Finnish/Swedish feedback.
- Mutation tests for stable error-code mapping, success, failure, query
  invalidation/refetch, absence of optimistic insertion, and duplicate-submit
  protection.
- Route/workflow tests for event-create continuation, add-another, finish,
  missing-event and missing-SKL states, cancel, browser back, refresh/close
  protection, and timezone-free event-date display.
- Regression tests for the existing result-edit modal and selected-event panel.
- Targeted web type checking and linting; do not run cycle lint in the agent
  workflow.
- Manual desktop and mobile checks for the long form and both continuation
  paths when browser tooling is available.

## Merge independence and review gate

R2 is the final BEJ-103 creation gate and can merge safely only after E1, E2,
and R1. It replaces E2's documented temporary redirect with the final
continuation behavior and leaves no dependency on deferred UX work.

Stop after validation and request final BEJ-103 review. Deferred items remain
unauthorized unless they are moved into an approved planning gate.
