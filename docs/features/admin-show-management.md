# Admin Show Management

Developer notes for the admin show management flow.

## Primary purpose

- The page is an admin-facing event search and detail workflow.
- The main user task is to find a show event, inspect its entries, and prepare edits from the read layer.
- Backend mutation foundations now exist for event update, entry update, and
  entry delete, and the page now wires apply/remove actions to those mutations.

## Main files

- `apps/web/app/(admin)/admin/shows/manage/page.tsx`: route entrypoint for the management page
- `apps/web/components/admin/shows/manage/admin-show-management-page-client.tsx`: page shell, query wiring, and selected-event composition
- `apps/web/components/admin/shows/manage/show-management-selected-event-panel.tsx`: selected-event presentation/controller wiring
- `apps/web/components/admin/shows/manage/show-management-filters.tsx`: search input
- `apps/web/components/admin/shows/manage/show-management-results.tsx`: event result table/cards
- `apps/web/components/admin/shows/manage/show-management-editor-panel.tsx`: selected-event editor composition
- `apps/web/components/admin/shows/manage/show-management-event-modal.tsx`: event edit modal
- `apps/web/components/admin/shows/manage/show-management-entry-modal.tsx`: entry edit modal
- `apps/web/components/admin/shows/manage/show-management-remove-panel.tsx`: destructive remove confirmation
- `apps/web/components/admin/shows/manage/internal/*`: feature-internal editor sections and entry form subcomponents
- `apps/web/hooks/admin/shows/manage/use-show-management-selected-event-state.ts`: thin composer hook
- `apps/web/hooks/admin/shows/manage/use-show-management-draft-state.ts`: draft state + dirty tracking
- `apps/web/hooks/admin/shows/manage/use-show-management-mutation-flow.ts`: mutation orchestration + server-sync reconciliation
- `apps/web/hooks/admin/shows/manage/use-unsaved-changes-unload-guard.ts`: beforeunload protection
- `apps/web/lib/admin/shows/manage/*`: pure draft mapping, display formatting, and mutation-state helper utilities
- `apps/web/components/admin/index.ts`: shared admin UI helper exports (`AdminFormModalShell`, `AdminRowActionsMenu`)
- `apps/web/queries/admin/shows/manage/use-admin-show-events-query.ts`: list query hook
- `apps/web/queries/admin/shows/manage/use-admin-show-event-query.ts`: detail query hook
- `apps/web/app/actions/admin/shows/manage/*`: admin show mutation server actions
- `apps/web/queries/admin/shows/manage/use-*-mutation.ts`: admin show mutation hooks
- `packages/api-client/admin/shows/*`: admin show API client helpers
- `packages/contracts/admin/shows/manage/*`: admin show search and detail contracts
- `packages/server/admin/shows/manage/*`: service-layer search and detail implementations
- `packages/db/admin/shows/manage/*`: DB search and detail mapping
- `packages/server/admin/shows/manage/update-show-event.ts`: event mutation use-case
- `packages/server/admin/shows/manage/update-show-entry.ts`: entry mutation use-case
- `packages/server/admin/shows/manage/delete-show-entry.ts`: entry delete mutation use-case
- `packages/db/admin/shows/manage/update-show-event.ts`: event write + lookup key sync
- `packages/db/admin/shows/manage/update-show-entry.ts`: entry write + result item sync
- `packages/db/admin/shows/manage/delete-show-entry.ts`: entry delete write

## Data flow

1. The page fetches event summaries through `useAdminShowEventsQuery`.
2. The selected summary drives `useAdminShowEventQuery` for full event details.
3. The page renders event results as a row-centric table/cards flow with action menus.
4. Event and entry edits happen in modals; remove remains a scoped confirm modal.
5. The detail panel maps contract entries and DB-driven result options into a local draft model (draft + applied snapshot).
6. Draft state, mutation flow, and unload guard are separated into focused hooks; pure helper logic stays in feature lib helpers.
7. Apply/remove actions persist through mutations, then refetch selected event details and reconcile local state from server data.

## Write foundations (backend)

Implemented backend mutation contracts and use-cases:

- `UpdateAdminShowEventRequest` / `UpdateAdminShowEventResponse`
- `UpdateAdminShowEntryRequest` / `UpdateAdminShowEntryResponse`
- `DeleteAdminShowEntryRequest` / `DeleteAdminShowEntryResponse`

Mutation behavior currently implemented in server/db layers:

- Event update validates admin access, normalizes input, persists event fields,
  and returns refreshed `showId` when date/place changes update canonical event
  identity.
- Event identity updates synchronize dependent lookup keys
  (`ShowEvent.eventLookupKey`, `ShowEntry.entryLookupKey`,
  `ShowResultItem.itemLookupKey`) in one transaction.
- Entry update validates admin access, normalizes editor values, updates entry
  scalar fields (`judge`, `critiqueText`, `heightText`) and synchronizes
  editable definition-backed result items for class/quality/placement/pupn/awards.
- Entry delete validates admin access and deletes one selected entry within the
  selected show scope.
- Entry result-item sync is scoped to the selected show event and entry.
- Entry delete relies on DB cascade rules to remove dependent `ShowResultItem`
  rows in the same transactional write.
- Entry update write validation expects class placement as a positive integer
  and PUPN rank in the supported `PU1..PU4` / `PN1..PN4` range.

Web layer status:

- Server actions exist for event update, entry update, and entry delete.
- React Query mutation hooks exist for event update, entry update, and entry delete.
- Apply event, apply entry, and remove entry actions call backend mutations.
- Mutation success invalidates admin show query roots and keeps selected event
  state synchronized, including show id changes after event identity updates.

## Contract rules

The admin show read contract is split into two shapes:

- `AdminShowSearchResponse`
  - `total`
  - `totalPages`
  - `page`
  - `items[]` of `AdminShowEventSummary`
- `AdminShowDetailsResponse`
  - `show` of `AdminShowDetailsEvent`
  - `options` of `AdminShowResultOptions`

The summary and detail models share the same event identity fields:

- `showId`
- `eventDate`
- `eventPlace`
- `eventCity`
- `eventName`
- `eventType`
- `organizer`
- `judge`

The detail response adds `entries[]` with:

- optional `dogId` (linked dog record id when available)
- registration number
- dog name
- judge
- critique text
- height
- class code
- quality grade
- class placement
- PUPN
- awards

The detail response also provides `options` for definition-backed editing:

- `classOptions[]`
- `qualityOptions[]`
- `awardOptions[]`
- `pupnOptions[]`

Option sourcing rules:

- `classOptions`, `qualityOptions`, and `awardOptions` are loaded from enabled `ShowResultDefinition` rows and their categories.
- `pupnOptions` is token-based (`PU1..PU4`, `PN1..PN4`) and exposed only when the canonical `PUPN` definition/category exists.
- Awards exclude class, quality, placement, and PUPN definitions.
- The meaning of `isVisibleByDefault` and `isEnabled` is defined in
  `docs/features/schema/show-schema.md`; follow that contract when adding new
  definition-backed UI or projection logic.
- Until the compatibility cleanup lands, entry projection may still preserve
  historical values for disabled definitions so old shows remain readable.

The entry cards intentionally do not repeat the event-level `eventType` field.
That value belongs only on the selected event section.

## Query rules

- Search uses the normalized query string from the page input.
- Search is always request-driven; there is no client-side fixture fallback.
- The selected detail query is disabled until a non-empty `showId` exists.
- The detail query trims the input `showId` before sending it to the API client.
- Both queries use React Query with a 30 second stale time.
- Admin show mutations invalidate admin show query roots.
- Admin dog mutations also invalidate public show query roots to keep show pages fresh after dog identity edits.

## Render rules

- Keep event search/results and selected-event editing on the same page.
- Show an empty message when there are no search results.
- Show a loading state while the selected event details are still loading.
- Show a descriptive error state if either search or detail loading fails.
- Keep entry edits local until the user applies them through write mutations.
- Keep the remove dialog scoped to the currently selected event entry.
- Event and entry edits use modal forms.
- Class and placement are edited as a compact paired row.
- Placement uses a numeric field so values above `4` remain supported.
- Quality is edited via a single-select control backed by `options`.
- PUPN is edited as a `-` / `PU` / `PN` prefix plus integer field so values
  like `PU8` remain supported and `-` clears the value.
- Awards are edited via multi-select backed by `options`.
- User-facing summary text and award chips render option labels when available
  instead of raw result codes. Unknown current values stay visible as
  `VALUE - Unknown current value`.
- If result options are unavailable from DB, show an inline warning and keep option-driven controls disabled.
- Each entry shows whether it is linked to a live dog record (`dogId`) or falls back to snapshot values.
- Do not show release-style changelog copy for this page unless the feature is actually shipped.

## Local draft behavior

- The page keeps an editable draft plus an applied snapshot for the selected event.
- Event-level and entry-level field edits update only the draft until apply.
- Award add/remove actions are applied from parent draft state so quick
  consecutive chip edits do not replace awards from a stale child snapshot.
- Draft awards use stable local item ids in the web editor so one visible chip
  maps to one remove action.
- Apply event/apply entry/remove entry call admin show mutation actions.
- Mutation success invalidates show queries and refreshes selected event state
  from server-normalized data.
- Reset reverts draft back to the latest server-synced applied snapshot.

## Tests

- Page composition and live-query wiring: `apps/web/components/admin/shows/manage/__tests__/admin-show-management-page-client.test.tsx`
- Detail query enable behavior: `apps/web/queries/admin/shows/manage/__tests__/use-admin-show-event-query.test.ts`
- Search query behavior: `apps/web/queries/admin/shows/manage/__tests__/use-admin-show-events-query.test.ts`
- API client helpers: `packages/api-client/admin/shows/__tests__/admin-shows.test.ts`
- Service behavior: `packages/server/admin/shows/manage/__tests__/*`
- Event mutation behavior: `packages/server/admin/shows/manage/__tests__/update-show-event.test.ts`
- Entry mutation behavior: `packages/server/admin/shows/manage/__tests__/update-show-entry.test.ts`
- Entry delete mutation behavior: `packages/server/admin/shows/manage/__tests__/delete-show-entry.test.ts`
- Event write behavior: `packages/db/admin/shows/manage/__tests__/update-show-event.test.ts`
- Entry write behavior: `packages/db/admin/shows/manage/__tests__/update-show-entry.test.ts`
- Entry delete write behavior: `packages/db/admin/shows/manage/__tests__/delete-show-entry.test.ts`
- Dog mutation invalidation behavior: `apps/web/queries/admin/dogs/manage/__tests__/use-*-admin-dog-mutation.test.ts`

## When to update this doc

- Update this file when the admin show search or detail contract changes.
- Update this file when the read flow changes from query-driven to action-driven.
- Update this file when write mutations are introduced for event or entry edits/deletes.
