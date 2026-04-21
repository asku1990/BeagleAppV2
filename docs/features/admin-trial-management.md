# Admin Trial Management

Developer notes for the admin trial read-only event/detail flow (`BEJ-76`,
`BEJ-81` and follow-up admin flow redesign).

## Primary purpose

- The admin list page is an event-first master-detail workflow for canonical
  AJOK `TrialEvent` + `TrialEntry` rows.
- The main user task is to search events, select one event, then inspect its
  dog rows without editing.
- The existing detail page (`/admin/trials/[trialId]`) remains available for a
  full row-level read-only view, including raw/source payload when available.

## Main files

- `apps/web/app/(admin)/admin/trials/page.tsx`: route entrypoint for event master-detail list
- `apps/web/app/(admin)/admin/trials/[trialId]/page.tsx`: route entrypoint for one trial result detail
- `apps/web/components/admin/trials/admin-trials-page-client.tsx`: event filters + event list + selected-event rows
- `apps/web/components/admin/trials/admin-trial-details-page-client.tsx`: read-only detail sections
- `apps/web/queries/admin/trials/manage/use-admin-trial-events-query.ts`: event list query hook
- `apps/web/queries/admin/trials/manage/use-admin-trial-event-query.ts`: selected event rows query hook
- `apps/web/queries/admin/trials/manage/use-admin-trial-query.ts`: detail query hook + mapped query errors
- `apps/web/app/api/admin/trials/route.ts`: list API route
- `apps/web/app/api/admin/trials/events/[trialEventId]/route.ts`: selected-event rows API route
- `apps/web/app/api/admin/trials/[trialId]/route.ts`: detail API route
- `packages/api-client/admin/trials/*`: admin trial API client methods
- `packages/contracts/admin/trials/manage/*`: list/detail contracts
- `packages/server/admin/trials/manage/*`: service-layer list/detail implementations
- `packages/db/admin/trials/manage/*`: DB list/detail mapping

## Data flow

1. List page fetches event summaries through `useAdminTrialEventsQuery`.
2. Event selection fetches selected event rows through `useAdminTrialEventQuery`.
3. Row action opens existing detail route `/admin/trials/[trialId]`.
4. Row action can also open `/api/trials/[trialId]/pdf` in a new tab.
5. Detail page fetches exactly one row through `useAdminTrialQuery`.
6. Detail UI renders grouped read-only sections (kokeen tiedot, koiran tiedot, pisteet ja tulos, osa-arvostelu, metadata, raw/source).

## Contract rules

- Event list response: paginated event summaries (`total`, `totalPages`,
  `page`, `filters`, `availableYears`, `items[]`).
- Event detail response: one event (`event`) with event header fields and
  selected dog rows (`entries[]`).
- Detail response: one row under `trial`.
- `TRIAL_NOT_FOUND` is returned as an error code from API/service layers for missing IDs.
- `TRIAL_EVENT_NOT_FOUND` is returned for missing event IDs.
- During BEJ-79 schema rollout, admin list/detail reads remain on `TrialResult`
  until BEJ-81 read-path switch.
- After BEJ-81 switch, detail/list identifiers are:
  - `sklKoeId` (preferred when available)
  - `entryKey` (`TrialEntry.yksilointiAvain`) as fallback.

## Render rules

- Event rows/cards are the interaction target for choosing a selected event.
- Selected event dog rows have two actions: open detail and open PDF.
- Detail view is strictly read-only; no update/remove controls.
- Detail shows all mapped typed canonical AJOK fields currently exposed by contract.
- Raw/source payload is shown in a collapsible read-only section.
- If payload is unavailable, detail shows localized fallback text.
- If detail query returns `TRIAL_NOT_FOUND`, show dedicated `notFound` state card (not generic error state).

## Tests

- `apps/web/components/admin/trials/__tests__/admin-trials-page-client.test.tsx`
- `apps/web/components/admin/trials/__tests__/admin-trial-details-page-client.test.tsx`
- `apps/web/queries/admin/trials/manage/__tests__/use-admin-trial-queries.test.ts`
- `apps/web/app/api/admin/trials/__tests__/route.test.ts`
- `apps/web/app/api/admin/trials/events/[trialEventId]/__tests__/route.test.ts`
- `apps/web/app/api/admin/trials/__tests__/detail-route.test.ts`
- `packages/api-client/admin/trials/__tests__/create-admin-trials-api-client.test.ts`
- `packages/server/admin/trials/manage/__tests__/*`
- `packages/db/admin/trials/manage/__tests__/*`

Parity sample evidence for BEJ-81:

- `packages/db/admin/trials/manage/__tests__/fixtures/parity-samples.ts`
- `packages/db/admin/trials/manage/__tests__/search-trials.parity.test.ts`
- `packages/db/admin/trials/manage/__tests__/get-trial-details.parity.test.ts`

## When to update this doc

- Update this file when the trial summary/detail contracts change.
- Update this file when event list filters, selection model, or row actions change.
- Update this file when detail section grouping/visibility changes.
- Update this file when not-found/error render behavior changes.
