# Admin Trial Management

Developer notes for the admin trial event flow (`BEJ-76`, `BEJ-81`, `BEJ-103`
and follow-up admin flow redesign).

## Primary purpose

- The admin list page is an event-first master-detail workflow for canonical
  AJOK `TrialEvent` + `TrialEntry` rows.
- An admin can search events, select one event, inspect and edit its metadata
  and dog rows, delete a result, or open the event at the stable
  `/admin/trials/[trialEventId]` workspace URL.
- Per-dog inspection opens the generated trial PDF. Existing event and result
  editing remains modal-based.

## Main files

- `apps/web/app/(admin)/admin/trials/page.tsx`: route entrypoint for event master-detail list
- `apps/web/app/(admin)/admin/trials/[trialEventId]/page.tsx`: stable event workspace route
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
4. Event and result changes use the existing admin mutations; the PDF action
   opens `/api/trials/[trialEntryId]/pdf` in a new tab.

## Contract rules

- Event list response: paginated event summaries (`total`, `totalPages`,
  `page`, `filters`, `availableYears`, `items[]`).
- Event detail response: one event (`event`) with event header fields and
  selected dog rows (`entries[]`).
- `TRIAL_EVENT_NOT_FOUND` is returned for missing event IDs.
- After BEJ-81 switch, event/list identifiers are:
  - `sklKoeId` (preferred when available)
  - `entryKey` (`TrialEntry.yksilointiAvain`) as fallback.

## Render rules

- Event rows/cards are the interaction target for choosing a selected event.
- The selected-event header has event edit and workspace navigation actions.
- Selected dog rows have PDF, edit, and result-delete actions.
- A missing workspace event is shown explicitly and never falls back to a
  different event.
- Until BEJ-103 Gate E2 changes the lifecycle, deleting the final result also
  deletes its event. The workspace then returns to `/admin/trials`; non-final
  and failed deletions remain on the workspace.

## Tests

- `apps/web/app/(admin)/admin/trials/[trialEventId]/__tests__/page.test.tsx`
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
