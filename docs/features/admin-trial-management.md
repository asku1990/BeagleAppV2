# Admin Trial Management

Developer notes for the admin trial event flow (`BEJ-76`, `BEJ-81`, `BEJ-103`
and follow-up admin flow redesign).

## Primary purpose

- The admin list page is an event-first master-detail workflow for canonical
  AJOK `TrialEvent` + `TrialEntry` rows.
- An admin can create and search events, select one event, inspect and edit its
  metadata and dog rows, delete a result, or open the event at the stable
  `/admin/trials/[trialEventId]` workspace URL.
- Empty events remain available to administrators. They can be deleted
  explicitly from their workspace, but only while they have no result rows.
- Per-dog inspection opens the generated trial PDF. Existing event and result
  editing remains modal-based.
- An admin can create one manual result at a time from an event workspace.
  The full-page form supports saving another result for the same event or
  finishing back at the workspace.
- Manual result creation resolves its visible score, era, and lisätieto fields
  from the event's persisted `trialRuleWindowId`. The 2023+ window is verified
  against its PDF field set; older, null, and unknown windows retain the
  complete compatibility form with a warning.

## Main files

- `apps/web/app/(admin)/admin/trials/page.tsx`: route entrypoint for event master-detail list
- `apps/web/app/(admin)/admin/trials/new/page.tsx`: full-page event creation route
- `apps/web/app/(admin)/admin/trials/[trialEventId]/page.tsx`: stable event workspace route
- `apps/web/app/(admin)/admin/trials/[trialEventId]/results/new/page.tsx`: manual result creation route
- `apps/web/components/admin/trials/admin-trial-event-create-page-client.tsx`: event creation form and continuation
- `apps/web/components/admin/trials/admin-trials-page-client.tsx`: event filters + event list + selected-event rows
- `apps/web/components/admin/trials/admin-trial-event-workspace-page-client.tsx`: one-event workspace states and navigation
- `apps/web/components/admin/trials/admin-trial-selected-event-panel.tsx`: selected-event rows and row actions
- `apps/web/components/admin/trials/admin-trial-entry-actions.tsx`: per-dog PDF action
- `apps/web/queries/admin/trials/manage/use-admin-trial-events-query.ts`: event list query hook
- `apps/web/queries/admin/trials/manage/use-admin-trial-event-query.ts`: selected event rows query hook
- `apps/web/app/api/admin/trials/route.ts`: list API route
- `apps/web/app/api/admin/trials/events/[trialEventId]/route.ts`: selected-event rows API route
- `packages/api-client/admin/trials/*`: admin trial API client methods
- `packages/contracts/admin/trials/manage/*`: event list and selected-event contracts
- `packages/server/admin/trials/manage/*`: service-layer event list and selected-event implementations
- `packages/db/admin/trials/manage/*`: DB event list and selected-event mapping
- `apps/web/app/api/trials/[trialId]/pdf/route.ts`: per-dog PDF endpoint used by row actions

## Data flow

1. List page fetches event summaries through `useAdminTrialEventsQuery`.
2. Event selection fetches selected event rows through `useAdminTrialEventQuery`.
3. The selected-event panel links to the stable event workspace, which fetches
   only the `trialEventId` from its route.
4. Event and result changes use admin Server Action mutations; the PDF action
   opens `/api/trials/[trialEntryId]/pdf` in a new tab.
5. Successful event creation opens the first manual result form for the new event.
6. Manual result creation validates and canonicalizes the typed registration,
   then atomically creates the entry, eras, and lisätiedot. A matching local
   `DogRegistration` links the dog; an unknown registration remains unlinked.
7. Successful result creation refetches admin event data and affected public
   trial, dog-profile trial, and home-statistics queries without optimistic rows.

## Contract rules

- Event list response: paginated event summaries (`total`, `totalPages`,
  `page`, `filters`, `availableYears`, `items[]`).
- Event detail response: one event (`event`) with event header fields and
  selected dog rows (`entries[]`). It includes the event-owned
  `trialRuleWindowId`; clients must not recalculate the window from the date.
- Event creation requires a positive `sklKoeId`, an ISO date, and a non-empty
  place. Duplicate SKL IDs return `SKL_KOE_ID_CONFLICT`.
- Manual result identity is `SKL:<sklKoeId>|REG:<canonicalRegistration>` and
  uses source `MANUAL_ADMIN`. Duplicate registration within an event returns
  `TRIAL_ENTRY_REGISTRATION_CONFLICT`.
- Manual result writes require each normalized lisätieto `(koodi, osa)` pair
  to occur only once across the submitted matrix rows.
- Lisätieto UI sorting is separate from its integer persisted `jarjestys`;
  unused create-form rows are omitted from the write payload.
- The result-create field registry owns create-only visibility, ordering,
  business grouping, semantic input kinds, localized value-hint categories,
  and control-to-persistence mapping. Shared edit components use their default
  complete field set and do not consume create-only configuration.
- Manual-result validation errors may carry safe structured field context for
  localized feedback without exposing raw user-entered values.
- `TrialEvent.koepaiva` is a PostgreSQL `DATE`; all trial contracts serialize
  it as timezone-free `YYYY-MM-DD`.
- Empty event deletion returns `TRIAL_EVENT_NOT_EMPTY` if result rows are
  present and `TRIAL_EVENT_NOT_FOUND` if the event no longer exists.
- `TRIAL_EVENT_NOT_FOUND` is returned for missing event IDs.
- After BEJ-81 switch, event/list identifiers are:
  - `sklKoeId` (preferred when available)
  - `entryKey` (`TrialEntry.yksilointiAvain`) as fallback.

## Render rules

- Event rows/cards are the interaction target for choosing a selected event.
- The selected-event header has event edit and workspace navigation actions.
- The event workspace links to the full-page result form. Dirty result forms
  confirm internal navigation and use native unload protection for refresh or
  close. Browser Back leaves the form without application confirmation because
  the App Router has no reliable asynchronous route-blocking hook.
- The result form shows only a localized rule-period label. For
  `trw_post_20230801`, entry- and era-level `tja`/`pin` are hidden, lisätieto
  codes 25 and 27 expose only part `a`, and codes 19, 23, 26, and 59 use their
  verified semantic input kinds. Other rule windows show the full compatibility
  set and an unverified-field warning.
- Selected dog rows have PDF, edit, and result-delete actions.
- A missing workspace event is shown explicitly and never falls back to a
  different event.
- Deleting the final result leaves its event persisted and displays the valid
  empty-event state in the workspace.
- Explicit event deletion is offered only for an empty event and is enforced
  by both the server and database write. Successful deletion returns to
  `/admin/trials`; failed deletion remains on the workspace.

## Tests

- `apps/web/app/(admin)/admin/trials/new/__tests__/page.test.tsx`
- `apps/web/app/(admin)/admin/trials/[trialEventId]/__tests__/page.test.tsx`
- `apps/web/components/admin/trials/__tests__/admin-trial-event-create-page-client.test.tsx`
- `apps/web/components/admin/trials/__tests__/admin-trial-event-workspace-page-client.test.tsx`
- `apps/web/components/admin/trials/__tests__/admin-trials-page-client.test.tsx`
- `apps/web/components/admin/trials/__tests__/admin-trial-entry-actions.test.tsx`
- `apps/web/components/admin/trials/__tests__/admin-trial-selected-event-panel.test.tsx`
- `apps/web/queries/admin/trials/manage/__tests__/use-admin-trial-queries.test.ts`
- `apps/web/app/api/admin/trials/__tests__/route.test.ts`
- `apps/web/app/api/admin/trials/events/[trialEventId]/__tests__/route.test.ts`
- `packages/api-client/admin/trials/__tests__/create-admin-trials-api-client.test.ts`
- `packages/server/admin/trials/manage/__tests__/*`
- `packages/db/admin/trials/manage/__tests__/*`

Parity sample evidence for BEJ-81:

- `packages/db/admin/trials/manage/__tests__/fixtures/parity-samples.ts`
- `packages/db/admin/trials/manage/__tests__/search-trials.parity.test.ts`
- `packages/db/admin/trials/manage/__tests__/get-trial-event-details.parity.test.ts`

## When to update this doc

- Update this file when the trial summary or selected-event contracts change.
- Update this file when event list filters, selection model, or row actions change.
