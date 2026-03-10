# Beagle Search

Developer notes for the public beagle search feature.

## Primary purpose

- The page is primarily a search workflow, not a dashboard.
- The main user task is to find a dog by EK number, registration number, or name.

## Main files

- `apps/web/components/beagle-search/beagle-search-page.tsx`: top-level page composition and render rules
- `apps/web/components/beagle-search/beagle-search-form.tsx`: primary search inputs, sort, advanced filter toggle
- `apps/web/components/beagle-search/beagle-search-empty-state.tsx`: start, error, and no-results states
- `apps/web/components/beagle-search/beagle-search-results-desktop-table.tsx`: desktop results rendering
- `apps/web/components/beagle-search/beagle-search-results-mobile-cards.tsx`: mobile results rendering
- `apps/web/components/beagle-search/beagle-search-pagination.tsx`: page and page-size controls
- `apps/web/hooks/public/beagle/search/use-beagle-search-ui-state.ts`: URL state parsing, draft form state, submit/reset/pagination/sort commits
- `apps/web/queries/public/beagle/search/use-beagle-search-query.ts`: main search query enable rules and request mapping
- `apps/web/queries/public/beagle/search/use-beagle-newest-query.ts`: secondary discovery list query
- `apps/web/lib/public/beagle/search/legacy-like-match.ts`: legacy-style wildcard semantics and local search mode helpers
- `apps/web/lib/public/beagle/search/clipboard.ts`: tab-separated export formatting for visible rows

## Data flow

1. `beagle-search-page.tsx` reads local form and URL-driven state from `useBeagleSearchUiState`.
2. The page sends `urlState` to `useBeagleSearchQuery` for the main search request.
3. The page separately calls `useBeagleNewestQuery(5)` for the discovery list.
4. Search results drive the render state for the main results section and whether the secondary discovery section is shown.

## Input and URL state model

- Draft input state lives in `formState` inside `use-beagle-search-ui-state.ts`.
- Committed search state lives in the URL query string and is exposed as `urlState`.
- `readUrlSearchState()` parses these params:
  - `ek`
  - `reg`
  - `name`
  - `sex`
  - `birthYearFrom`
  - `birthYearTo`
  - `ekOnly=1`
  - `multiRegs=1`
  - `page`
  - `pageSize`
  - `sort`
  - `adv=1`
- `toSearchQueryString()` writes only non-default values back to the URL.
- `submitSearch()` trims primary fields, normalizes birth years, keeps current sort and page size, and resets `page` to `1`.
- `resetSearch()` clears draft fields and commits the default URL state.
- Pagination and sort changes are URL-driven, so browser navigation restores them.

## Search state model

- `resolvePrimarySearchMode(formState)` determines the local primary mode from the three main inputs.
- `hasAdvancedFilters` becomes true when any advanced filter has a non-default value.
- `effectiveFormMode` becomes `combined` when the main inputs alone would produce `none` but advanced filters are active.
- `canSubmit` is true when at least one primary field is filled or an advanced filter is active.
- `searchResults.mode` is the render source of truth after query data resolves.

## Wildcard and matching behavior

- Wildcard semantics live in `legacy-like-match.ts`.
- Supported wildcard characters:
  - `%` matches zero or more characters
  - `_` matches exactly one character
- `hasLegacyWildcard()` detects whether the user already supplied wildcard characters.
- `buildLegacyPattern()` applies field-specific defaults when the user did not type explicit wildcards:
  - `name`: wraps the value as `%value%`
  - `reg`: converts the value to `value%`
  - `ek`: uses exact input
- If the user provides explicit wildcards, the value is preserved as-is.
- `matchesLegacyLike()` converts the SQL-like pattern to a case-insensitive regex. This is documented and unit-tested in `apps/web/lib/public/beagle/search/__tests__/legacy-like-match.test.ts`.
- The UI wildcard help text in the form is backed by these semantics, so changes to wildcard behavior must update both code and copy.

## Query behavior

- Main search fetching lives in `use-beagle-search-query.ts`.
- The main query is disabled until at least one of these is present:
  - `ek`
  - `reg`
  - `name`
  - valid `birthYearFrom`
  - valid `birthYearTo`
  - `ekOnly`
  - non-default `sex`
  - `multipleRegsOnly`
- Invalid birth-year inputs are normalized away before the request is sent.
- The request is executed through `apps/web/app/actions/public/beagle/search/search-dogs.ts`, which logs start, success, and failure metadata.
- Query caching keys are defined in `apps/web/queries/public/beagle/search/query-keys.ts`. The main key includes all search inputs that affect server results, including pagination and sort.
- `adv` is UI state only and is not part of the query key.

## Render rules

- Keep the search form as the main entry point.
- Keep the search results section visible even before search so the page structure stays stable.
- Before search, the results section shows the `start` empty state.
- When `searchResults.mode === "none"`, `showNewestAdditions` is true and the page renders `Viimeisimmät lisäykset`.
- When `searchResults.mode !== "none"`, the page hides `Viimeisimmät lisäykset` so discovery content does not compete with active search results or no-results feedback.
- Loading and error toasts are handled separately for the main search query and the newest-additions query.

## Newest additions

- `Viimeisimmät lisäykset` is secondary discovery content for the search page.
- The list comes from `useBeagleNewestQuery(5)`.
- The query uses its own cache key and refreshes every 5 minutes with `refetchOnWindowFocus` enabled.
- The data is loaded through `apps/web/app/actions/public/beagle/search/get-newest-dogs.ts`, which uses the server dogs service and structured action logging.
- It is shown only before a search is active.
- It is hidden when the user has active search results or a no-results state, so it does not compete with the main search task.

## Legacy-compatible search behavior

- The page supports a legacy-compatible primary search mode.
- One main field at a time is the default legacy-compatible behavior.
- Advanced filters may expand the effective mode to a combined search.

## Sorting, pagination, and advanced filters

- Default sort is `name-asc`.
- Supported sort values are validated in `apps/web/hooks/public/beagle/search/use-beagle-search-ui-state.ts`.
- Supported page sizes are defined in `apps/web/lib/public/beagle/search/types.ts` as `10`, `25`, `50`, and `100`.
- Changing page size or sort resets the page to `1`.
- The advanced filter panel open state is persisted in the URL as `adv=1`.
- `birthYearFrom` and `birthYearTo` are accepted only as 4-digit years after normalization in `apps/web/lib/public/beagle/search/birth-year.ts`.

## Result actions and clipboard export

- Result rows link to the dog profile through the primary registration number and name.
- Desktop table scanning order is `Rekisterinumero`, `Nimi`, `EK-numero`, `Sukupuoli`, `Kokeet`, `Näyttelyt`.
- The same forward-navigation pattern is used on desktop and mobile for consistency: both `Rekisterinumero` and `Nimi` link to the canonical dog profile.
- Do not add an extra profile CTA to the same result item while this pattern is in use.
- The search results view intentionally avoids separate placeholder action buttons. Additional actions should be reintroduced only when they have real destinations or implemented behavior.
- `handleCopyResults()` in `apps/web/components/beagle-search/beagle-search-page.tsx` copies only the currently visible result page.
- Clipboard formatting is handled by `apps/web/lib/public/beagle/search/clipboard.ts`.
- Export output is TSV with a localized header row.
- Tabs and newlines are sanitized from cell content before export.
- Additional registration numbers are exported as a comma-separated list excluding the primary registration number.

## Error and loading behavior

- Search loading state is shown when the UI transition is pending or the main query is fetching without prior data.
- Main search failures show the search empty-state error and a toast.
- Newest-additions failures show a separate toast and an error state inside the secondary section when that section is visible.
- The toast notification refs in `apps/web/components/beagle-search/beagle-search-page.tsx` prevent duplicate notifications for the same current error condition.

## Why the results section stays visible before search

- The page is still a search page even before the first query.
- Keeping the results shell visible preserves a stable layout and gives the user a clear start-state instruction.
- `Viimeisimmät lisäykset` is intentionally secondary to that main search container.

## Tests

- Page-level render behavior is covered in `apps/web/components/beagle-search/__tests__/beagle-search-page.test.ts`.
- URL state behavior is covered in the hook tests under `apps/web/hooks/public/beagle/search/__tests__`.
- Wildcard semantics are covered in `apps/web/lib/public/beagle/search/__tests__/legacy-like-match.test.ts`.
- Query mapping and enable rules are covered in:
  - `apps/web/queries/public/beagle/search/__tests__/use-beagle-search-query.test.ts`
  - `apps/web/queries/public/beagle/search/__tests__/use-beagle-newest-query.test.ts`
- Clipboard export formatting is covered in `apps/web/lib/public/beagle/search/__tests__/clipboard.test.ts`.

## When to update this doc

- Update this file when data flow, search-state rules, page hierarchy, empty-state behavior, newest-additions behavior, or legacy-search rules change.
