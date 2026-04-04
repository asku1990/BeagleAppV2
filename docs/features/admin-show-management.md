# Admin Show Management

Developer notes for the admin show management flow.

## Primary purpose

- The page is an admin-facing event search and detail workflow.
- The main user task is to find a show event, inspect its entries, and prepare edits from the read layer.
- Backend mutation foundations now exist for event update, entry update, and
  entry delete, even though the page UI still runs local apply/remove behavior
  until mutation wiring is completed.

## Main files

- `apps/web/app/(admin)/admin/shows/manage/page.tsx`: route entrypoint for the management page
- `apps/web/components/admin/shows/manage/admin-show-management-page-client.tsx`: page shell, query wiring, and selected-event composition
- `apps/web/components/admin/shows/manage/show-management-selected-event-panel.tsx`: selected-event presentation/controller wiring
- `apps/web/hooks/admin/shows/manage/use-show-management-selected-event-state.ts`: selected-event draft state and local apply/reset behavior
- `apps/web/components/admin/shows/manage/show-management-search-panel.tsx`: event search list
- `apps/web/components/admin/shows/manage/show-management-editor-panel.tsx`: selected event and entry editor UI
- `apps/web/components/admin/shows/manage/show-management-entry-card.tsx`: per-entry card composition
- `apps/web/components/admin/shows/manage/internal/*`: entry header, summary, result fields, awards editor, and critique field
- `apps/web/components/admin/shows/manage/show-management-remove-panel.tsx`: destructive remove confirmation
- `apps/web/lib/admin/shows/manage/*`: shared draft mapping, display formatting, logging payloads, and entry update helpers
- `apps/web/queries/admin/shows/manage/use-admin-show-events-query.ts`: list query hook
- `apps/web/queries/admin/shows/manage/use-admin-show-event-query.ts`: detail query hook
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
3. The search list renders contract summaries (`showId`, dates, place, city, name, type, organizer, judge, dog count).
4. The detail panel maps contract entries and DB-driven result options into the local editor model so the UI can keep a draft copy separate from the loaded data.
5. Feature-local hook state owns the selected-event draft lifecycle, while feature-local lib helpers own draft cloning, field updates, and label resolution.
6. Apply/remove/reset actions currently only update local draft state.

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

Not yet implemented in web layer:

- Server actions for these mutations
- React Query mutation hooks for show management
- UI wiring from apply/remove buttons to backend mutations

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

## Render rules

- Keep the search list and editor side by side on wide screens.
- Show an empty message when there are no search results.
- Show a loading state while the selected event details are still loading.
- Show a descriptive error state if either search or detail loading fails.
- Keep entry edits local until write mutations exist.
- Keep the remove dialog scoped to the currently selected event entry.
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
- Do not show release-style changelog copy for this page unless the feature is actually shipped.

## Local draft behavior

- The page keeps two local copies of the selected event:
  - the editable draft
  - the last applied local snapshot
- Event-level field edits update the draft copy only.
- Entry-level scalar fields update the draft copy only through explicit
  field-based handlers.
- Award add/remove actions are applied from the parent draft state so quick
  consecutive chip edits do not replace awards from a stale child snapshot.
- Draft awards use stable local item ids in the web editor so one visible chip
  maps to one remove action.
- Apply buttons update the local applied snapshot, not the server.
- Reset reverts the draft back to the last applied local snapshot.
- Remove confirmation updates both local copies so the UI stays internally consistent.
- This local-only apply behavior is transitional and will be replaced once web
  mutation actions/hooks are connected to the backend write use-cases.

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

## When to update this doc

- Update this file when the admin show search or detail contract changes.
- Update this file when the read flow changes from query-driven to action-driven.
- Update this file when write mutations are introduced for event or entry edits/deletes.
