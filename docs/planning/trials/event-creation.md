# BEJ-103 Event Creation

## Purpose

This plan introduces a stable event workspace before adding manual event
creation. It deliberately leaves the existing `/admin/trials` master-detail
flow intact. The accepted cross-slice decisions and review rules are defined in
the [planning overview](./README.md).

## Target event lifecycle

The planned lifecycle is:

`Empty event -> results added -> event with results -> final result removed -> empty event remains persisted`

Rules:

- An empty `TrialEvent` is valid persisted admin-only state.
- Empty state is not a separate draft or publish status.
- Adding the first result makes the event eligible for the existing public
  trial reads; no public UI behavior is changed here.
- Removing the final result must not automatically delete the `TrialEvent`.
- Explicit event deletion is permitted only while the event has zero results.
- The server and database enforce the empty-only delete rule; hiding a UI
  action is not sufficient authorization or consistency protection.

## Gate E1: Event workspace

### Scope

- Add a dedicated `/admin/trials/[trialEventId]` workspace route for one
  `trialEventId`.
- Reuse the existing admin event detail query, event summary, result list,
  event-edit action, result-edit modal, PDF action, and result-delete action
  where practical.
- Add an explicit way to open the workspace from the current trials page.
- Provide loading, missing-event, and read-error states on the workspace.
- Provide retry for generic read failures.
- Never select or display a different event when the requested event is
  missing.
- Keep authorization at the existing admin layout and backend boundaries.

### Exclusions

- No event or result creation.
- No event deletion or change to final-result deletion.
- No redesign or removal of the current master-detail interface.
- No change to existing result editing.
- No public UI, statistics, import, schema, or API behavior changes.

### Dependencies

- Existing admin event list/detail contracts and HTTP read transport.
- Existing admin event and result actions.
- No dependency on E2, R1, or R2.

### Acceptance criteria

- An admin can open a stable URL for an existing event and see the same event
  metadata and result rows available in the master-detail panel.
- Existing edit, PDF, and result-delete actions retain their current behavior.
- Missing and inaccessible event states are handled without falling back to a
  different event.
- Deleting a non-final result or failing to delete a result leaves the admin on
  the workspace. If current final-result deletion also deletes the event, the
  workspace returns to `/admin/trials`.
- The current trials list continues to work as before.

### Targeted validation

- Add focused route/component tests for loading, success, missing, and error
  states.
- Cover retry, workspace navigation, no self-link, no missing-event fallback,
  and all current result-deletion outcomes.
- Run the existing selected-event component and action tests affected by reuse.
- Run targeted web type checking and linting for touched code.
- Manually verify the workspace at desktop and mobile widths when browser
  tooling is available.
- Do not run cycle lint in the agent workflow.

### Merge independence and review gate

E1 can be merged safely on its own. It adds an alternate route to current
behavior and does not leave a partially enabled creation workflow.

Stop after validation and request explicit review. Do not start E2 without
separate approval.

## Gate E2: Event creation and empty-event lifecycle

### Scope

- Add admin event-create request/response contracts, a server use-case, a
  focused DB write, and a Server Action mutation path.
- Add a full-page event-create form linked from the existing trials page.
- Require a positive `sklKoeId`, a valid event date, and a non-empty event
  place. Keep the remaining existing event metadata fields optional.
- Reject creation when the unique `TrialEvent.sklKoeId` already belongs to an
  event; do not turn a create request into an update.
- During event creation, resolve the initial `trialRuleWindowId` from the
  entered event date using the existing active rule-window behavior.
- Change result deletion so removing the final `TrialEntry` leaves the
  `TrialEvent` persisted and empty.
- Add explicit event deletion that succeeds only when the event has zero
  entries and rejects a non-empty event.
- Show the valid empty state and empty-only delete action in the event
  workspace.

### Temporary continuation behavior

When E2 is implemented without R2, successful event creation returns to the
new event workspace. This is intentional, complete temporary behavior: the
admin can inspect, edit, or explicitly delete the empty event.

Gate R2 later changes the primary successful continuation to the first manual
result form. Canceling or leaving that later form still returns to the same
persisted event workspace.

### Exclusions

- No manual result write path or result-create form.
- No separate draft/publish state.
- No automatic cleanup or expiry for empty events.
- No cascade deletion of a non-empty event.
- No redesign of the trials index or existing result-edit modal.
- No change to later event-edit behavior, including rule-window recalculation
  when an existing event date is edited. Any such change requires its own
  approved planning change.
- No public UI, statistics, or import redesign.

### Dependencies

- E1 must be approved and merged so event creation has a stable destination.
- Existing event validation, date parsing, rule-window resolution, admin
  authorization, and structured logging conventions must be reused.

### Acceptance criteria

- An authorized admin can create an event with the required identity fields
  and optional existing event metadata, with its initial `trialRuleWindowId`
  resolved from the entered event date.
- Invalid required values and an already-used SKL ID return stable validation
  or conflict errors without creating an event.
- The created event is visible to admin reads, opens in its workspace, and is
  absent from existing public trial search/detail while empty.
- Removing the final result leaves the event empty and persisted.
- Explicit deletion succeeds for an empty event and rejects an event that has
  results.
- Event creation and deletion are logged through the shared structured logger.

### Targeted validation

- DB tests for create, duplicate SKL ID, rule-window assignment, empty-only
  delete, and final-result removal.
- Server tests for authorization, normalization, validation, conflicts,
  not-found behavior, and error mapping.
- Server Action and mutation tests for authentication, error propagation,
  navigation data, and query invalidation.
- Web form/workspace tests for required fields, failure preservation, success,
  empty state, and empty-only deletion.
- Regression tests proving public search/detail continue to exclude an empty
  event.
- Targeted type checking and linting for touched packages; do not run cycle
  lint in the agent workflow.

### Merge independence and review gate

E2 can be merged safely after E1 without R1 or R2. Empty events have a complete
admin lifecycle, remain hidden from public reads, and can be removed explicitly.
The temporary post-create workspace continuation must be included in the E2
implementation and release communication.

Stop after validation and request explicit review. The planned schema work in
R1 requires separate approval before it begins.
