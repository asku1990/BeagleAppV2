# Admin Trial Management

Developer notes for the admin trial read-only list/detail flow (`BEJ-76`,
`BEJ-81`) and AJOK validation-gap panel baseline (`BEJ-77`).

## Primary purpose

- The page is an admin-facing search and detail workflow for canonical AJOK
  `TrialEntry` + `TrialEvent` rows.
- The main user task is to find one trial result row and inspect all typed fields without editing.
- The detail page can also show raw/source payload when available in the current model.
- The page also exposes a read-only validation panel that visualizes current AJOK
  pöytäkirja gaps (missing vs incomplete) for schema planning.

## Main files

- `apps/web/app/(admin)/admin/trials/page.tsx`: route entrypoint for trial result list
- `apps/web/app/(admin)/admin/trials/[trialId]/page.tsx`: route entrypoint for one trial result detail
- `apps/web/components/admin/trials/admin-trials-page-client.tsx`: list filters + result rows/cards
- `apps/web/components/admin/trials/admin-trial-details-page-client.tsx`: read-only detail sections
- `apps/web/components/admin/trials/admin-trial-validation-panel.tsx`: shared read-only AJOK validation-gap panel for detail + search contexts
- `apps/web/queries/admin/trials/manage/use-admin-trials-query.ts`: list query hook
- `apps/web/queries/admin/trials/manage/use-admin-trial-query.ts`: detail query hook + mapped query errors
- `apps/web/lib/admin/trials/manage/trial-validation-gaps.ts`: validation gap catalog + evaluator against current `AdminTrialDetails` model
- `apps/web/app/api/admin/trials/route.ts`: list API route
- `apps/web/app/api/admin/trials/[trialId]/route.ts`: detail API route
- `packages/api-client/admin/trials/*`: admin trial API client methods
- `packages/contracts/admin/trials/manage/*`: list/detail contracts
- `packages/server/admin/trials/manage/*`: service-layer list/detail implementations
- `packages/db/admin/trials/manage/*`: DB list/detail mapping

## Data flow

1. List page fetches result summaries through `useAdminTrialsQuery`.
2. Row/card selection navigates to `/admin/trials/[trialId]`.
3. Detail page fetches exactly one row through `useAdminTrialQuery`.
4. Detail UI renders grouped read-only sections (kokeen tiedot, koiran tiedot, pisteet ja tulos, osa-arvostelu, metadata, raw/source).
5. Validation panel compares current read model against AJOK target field set and shows:
   - `missing_from_model`: field not represented in current read contract.
   - `available_but_incomplete`: field exists in current model but selected row value is empty/null.

## Contract rules

- List response: paginated summaries (`total`, `totalPages`, `page`, `items[]`).
- Detail response: one row under `trial`.
- `TRIAL_NOT_FOUND` is returned as an error code from API/service layers for missing IDs.
- Validation target field source of truth for AJOK baseline is
  `docs/features/trials/ajokoe-koirakohtainen-poytakirja.md`.
- The BEJ-78 flow-gate contract is archived; the active read/write docs now
  live under `docs/features/trials/`.
- During BEJ-79 schema rollout, admin list/detail reads remain on `TrialResult`
  until BEJ-81 read-path switch.
- After BEJ-81 switch, detail/list identifiers are:
  - `sklKoeId` (preferred when available)
  - `entryKey` (`TrialEntry.yksilointiAvain`) as fallback.

## Render rules

- List rows/cards are the interaction target for opening detail.
- Detail view is strictly read-only; no update/remove controls.
- Detail shows all mapped typed canonical AJOK fields currently exposed by contract.
- Raw/source payload is shown in a collapsible read-only section.
- If payload is unavailable, detail shows localized fallback text.
- If detail query returns `TRIAL_NOT_FOUND`, show dedicated `notFound` state card (not generic error state).
- Detail view renders the validation panel and evaluates both missing and incomplete categories against selected row data.
- Search/list view renders the same panel in baseline mode and shows only model-level missing fields (incomplete evaluation is detail-only because the list query does not load full row payload).
- Validation panel is analysis/visualization only and does not mutate data.
- This panel is a baseline input to the historical AJOK read-model work
  and later read-path migration updates in `BEJ-82`.

## Tests

- `apps/web/components/admin/trials/__tests__/admin-trials-page-client.test.tsx`
- `apps/web/components/admin/trials/__tests__/admin-trial-details-page-client.test.tsx`
- `apps/web/lib/admin/trials/manage/__tests__/trial-validation-gaps.test.ts`
- `apps/web/queries/admin/trials/manage/__tests__/use-admin-trials-query.test.ts`
- `apps/web/app/api/admin/trials/__tests__/route.test.ts`
- `apps/web/app/api/admin/trials/__tests__/detail-route.test.ts`
- `packages/api-client/admin/trials/__tests__/admin-trials.test.ts`
- `packages/server/admin/trials/manage/__tests__/*`
- `packages/db/admin/trials/manage/__tests__/*`

Parity sample evidence for BEJ-81:

- `packages/db/admin/trials/manage/__tests__/fixtures/parity-samples.ts`
- `packages/db/admin/trials/manage/__tests__/search-trials.parity.test.ts`
- `packages/db/admin/trials/manage/__tests__/get-trial-details.parity.test.ts`

## When to update this doc

- Update this file when the trial summary/detail contracts change.
- Update this file when detail section grouping/visibility changes.
- Update this file when not-found/error render behavior changes.
- Update this file when AJOK validation target fields or classification rules change.
