# Plan

Implement public virtuaaliparitus at `/beagle/virtual-pairing` by reusing the existing v2 calculation primitives while adding a public DTO boundary and public-side UI. The first slice should cover search, selection, calculation, and result presentation only; it should use the current public Beagle visual language and avoid exposing admin-only diagnostics or health details.

## Current state

- Observed:
  - Admin virtual pairing already exists at `/admin/dogs/virtual-pairing`.
  - Admin search uses `/api/admin/dogs/virtual-pairing` and the shared `packages/server/dogs/virtual-pairing/searchVirtualPairingDogs` primitive.
  - Admin calculation is implemented in `packages/server/admin/dogs/virtual-pairing/calculate-virtual-pairing.ts` and includes auth, inbreeding, EPI, Lafora, risk, PUR, diagnostics, and placeholders.
  - Shared inbreeding and health primitives live in `packages/server/dogs/core`.
  - The public sidebar already has `/beagle/virtual-pairing`, but it is marked planned and filtered out.
  - Public pages use `FeatureHeroHeader`, `ListingSectionShell`, `ListingResponsiveResults`, and `beagleTheme`.
  - Public dog search already has trial/show counts in `packages/db/dogs/core/dog-row-loader.ts`, but virtual-pairing search DTO currently lacks counts.
  - v1 public search shows EK number, registration number, sex, dog name, trial/show counts, size summary, and a sire/dam select action.
  - v1 public result shows sire/dam names and registrations, known pedigree percentage, adjusted inbreeding coefficient, raw Fx only when different, EPI risk line with `epi-info`, swap action, dog-position checkbox, SP selector 5-9, calculation-basis list, optional positions, and calculation time.
- Constraints/risks:
  - `ARCHITECTURE.md` requires business logic in `packages/server` and prevents importing `packages/server` or `packages/db` into web UI/client code.
  - Public route must not call admin services because admin DTOs include data that is out of scope for public users.
  - Public calculation must not introduce new inbreeding, EPI, Lafora, PUR, or risk semantics.
  - Existing grouped inbreeding contributions keep only one sire/dam position per ancestor; public "show dog positions" parity needs all included positions per ancestor.
  - Admin supports SP 4-12, while v1 public result selector exposes SP 5-9; public v2 should intentionally use the wider admin-compatible 4-12 range.
- Unknowns:
  - Whether public virtual puppy pedigree PDF or a later pedigree page belongs in a follow-up slice.
  - Whether v1 search "Koko" size summary should be carried over exactly; the Linear acceptance criteria only requires show/test counts.

## Assumptions

- Use SP 4-12 in the public UI and public request parser, matching the admin-side range even though v1 public exposed only 5-9.
- Do not expose Lafora, PUR, admin risk internals, diagnostic counters, placeholder sections, or debug data in public responses.
- Do not create the virtual pedigree link/page in the first BEJ-124 slice unless explicitly added to acceptance criteria.
- Do not include v1 public search parent hover tooltip unless requested; it exposes extra parent data that is not listed in the ticket's public search parity requirements.

## Scope

- In:
  - Add public `/beagle/virtual-pairing` page.
  - Enable public sidebar link.
  - Add public search, selection, calculation, and result presentation.
  - Add public contracts and server mappers that expose only the v1 public data set.
  - Reuse shared current-data inbreeding and health primitives.
  - Add public trial/show counts to virtual-pairing search results.
  - Add all-position data needed by the public "show dog positions" checkbox.
  - Add Finnish and Swedish messages.
  - Add focused tests for contracts, server mapping, queries, URL state, and components.
- Out:
  - Admin-only epilepsy search fields.
  - Admin diagnostics/debug placeholders.
  - New health or pedigree calculation semantics.
  - Persisting virtual pairing results.
  - Public PDF generation unless clarified as required for BEJ-124.

## Existing examples

- `apps/web/components/beagle-search/*`: public form, responsive table/cards, empty/loading states, and public visual language.
- `apps/web/components/beagle-shows/*` and `apps/web/components/beagle-trials/*`: `FeatureHeroHeader`, `ListingSectionShell`, pagination, and public query flow.
- `apps/web/components/admin/dogs/virtual-pairing/*`: search/select/calculate state model that can inform, but not directly define, public presentation.
- `packages/server/admin/dogs/virtual-pairing/calculate-virtual-pairing.ts`: current calculation sequence to refactor behind public/admin mappers.
- `../beagleAppV1/paritus.php`, `../beagleAppV1/paritustulos.php`, `../beagleAppV1/virtuaalisuku.php`: public parity references.

## Plan artifact

- `docs/planning/bej-124-public-virtual-pairing.md`

## Changelog

- `CHANGELOG.md`: add under `## Unreleased` / `Added`: "Public virtuaaliparitus flow with v1 public search/result parity." Include the main files touched when implementation starts.

## Files to touch

- `CHANGELOG.md`
- `docs/features/public-virtual-pairing.md`
- `docs/features/admin-virtual-pairing.md`
- `apps/web/app/(public)/beagle/virtual-pairing/page.tsx`
- `apps/web/app/(public)/beagle/virtual-pairing/pedigree/page.tsx`
- `apps/web/app/api/public/beagle/dogs/virtual-pairing/search/route.ts`
- `apps/web/app/api/public/beagle/dogs/virtual-pairing/calculate/route.ts`
- `apps/web/components/beagle-virtual-pairing/*`
- `apps/web/hooks/public/beagle/dogs/virtual-pairing/*`
- `apps/web/lib/public/beagle/dogs/virtual-pairing/*`
- `apps/web/queries/public/beagle/dogs/virtual-pairing/*`
- `apps/web/lib/i18n/messages/beagle/virtual-pairing.ts`
- `apps/web/lib/i18n/messages.ts`
- `apps/web/components/sidebar/app-sidebar.tsx`
- `packages/contracts/dogs/virtual-pairing/*`
- `packages/server/dogs/virtual-pairing/*`
- `packages/server/admin/dogs/virtual-pairing/calculate-virtual-pairing.ts`
- `packages/server/dogs/core/inbreeding-coefficient.ts`
- `packages/db/dogs/virtual-pairing/*`
- Relevant `index.ts` re-export files in touched folders.

## Phased steps

Phase 0: confirm data contract and privacy boundary.

- Checkpoint: public DTO list contains only fields from v1 public parity and the Linear ticket.

Phase 1: refactor backend calculation without behavior change.

- Checkpoint: admin virtual-pairing tests still pass and admin response shape stays compatible.

Phase 2: add public server/contracts/API.

- Checkpoint: unauthenticated public search and calculation return public-only DTOs.

Phase 3: build public UI.

- Checkpoint: `/beagle/virtual-pairing` works on mobile and desktop using public Beagle styling.

Phase 4: document and validate.

- Checkpoint: docs, changelog, unit tests, typecheck, and manual browser verification are complete.

## UI Direction

- Page framing:
  - Use `FeatureHeroHeader` with the existing logo and public description.
  - Use warm public panels from `beagleTheme`, not admin cards as-is.
  - Keep the workflow visible as three sections: search, selected virtual pair, result.
- Search layout:
  - Mobile: stacked field selector/input/actions, then result cards.
  - Desktop: compact search panel above a responsive result table.
  - Search mode is one field at a time: EK number, registration number, or name.
  - Results table columns: EK, registration number, sex, name, Ko/Nä counts, select action.
  - Mobile cards should surface name and registration first, then EK/sex/counts/actions.
- Selected pair layout:
  - Use two side-by-side slots on desktop and stacked slots on mobile.
  - Sire and dam slots show role label, dog name, registration number, and clear action.
  - Calculate button is disabled until both roles are selected and sex validation passes.
- Result layout:
  - Top summary panel shows sire/dam, SP, known pedigree percentage, and final inbreeding.
  - Display raw Fx in parentheses only when it differs from adjusted coefficient.
  - Show EPI risk as a single public line with an `epi-info` link.
  - Provide actions: swap sire/dam, update SP in the 4-12 range, and toggle dog positions.
  - Calculation basis uses an ordered list with ancestor label, adjusted percentage, raw percentage when different, and optional position lines.
  - Calculation time is low-emphasis metadata at the bottom of the result section.

## Component specs

- `BeagleVirtualPairingPage`:
  - Purpose: orchestrate URL state, search state, selected pair, calculation query, and result rendering.
  - States: start, searching, search error, no search results, pair incomplete, calculating, calculation error, result ready.
  - Accessibility: one `h1`, labelled sections, form submit works by keyboard, visible focus on all controls.
- `VirtualPairingSearchForm`:
  - Inputs: `field`, `query`, `isPending`, `canSubmit`.
  - Variants: default, pending, invalid empty query.
  - States: default, focus-visible, disabled, loading, error helper.
- `VirtualPairingSearchResults`:
  - Inputs: public search rows, loading/error/empty metadata, select handlers.
  - Variants: desktop table and mobile cards.
  - States: loading skeleton, empty message, limited-results warning, error recovery.
- `VirtualPairingSelectedPair`:
  - Inputs: sire, dam, SP, calculating state, validation messages.
  - Interactions: clear role, swap roles, change SP, calculate.
  - Accessibility: role slots are labelled and updates should be announced with polite status text.
- `VirtualPairingResultPanel`:
  - Inputs: public calculation response and `showPositions`.
  - Variants: result ready, no result, loading, error.
  - Content rules: no Lafora, PUR, internal diagnostics, or admin placeholders.

## Visual system choices

- Reuse existing public tokens from `beagleTheme`.
- Use `beagleTheme.panel` for main surfaces and `beagleTheme.subpanel` or bordered rounded panels for nested result areas.
- Type scale:
  - Hero title: existing `FeatureHeroHeader`.
  - Section headings: `beagleTheme.headingMd`.
  - Important numeric values: `text-2xl md:text-3xl`, `font-semibold`, `tabular-nums`.
  - Calculation basis: monospace or tabular numeric treatment only for percentage rows, not for whole page.
- Spacing:
  - Page sections: `space-y-6`.
  - Panel content: `px-5 py-5 md:px-6 md:py-6`.
  - Dense basis rows: `space-y-1`, readable line height.
- Elevation:
  - Stay within existing public card/border language; avoid admin dashboard styling.

## Edge states

- Loading:
  - Search results use skeleton/card placeholders matching final row height.
  - Calculation button changes label and disables duplicate submits.
- Empty:
  - Start state tells user to search and select a sire and dam.
  - No results state says the query found no dogs and suggests narrowing/changing field.
- Error:
  - Search error and calculation error should be plain-language, retryable, and not expose internal codes.
  - Invalid sire/dam sex should be shown near the selected pair controls.
- Privacy:
  - Public API responses omit admin health subfields, diagnostic counters, raw helper structures, and placeholder/debug sections.

## Action items

[ ] Add public contracts for virtual-pairing search, calculation, contribution rows, and optional positions.
[ ] Refactor admin calculation to call a shared unauthenticated calculation primitive, then map admin-only fields in the admin service.
[ ] Extend shared inbreeding breakdown to optionally preserve all included sire/dam positions per grouped ancestor for public position display.
[ ] Add public DB/search mapping with trialCount and showCount while keeping admin search response compatible.
[ ] Add public route handlers and React Query hooks for search and calculation.
[ ] Build public UI components under `apps/web/components/beagle-virtual-pairing`.
[ ] Enable `/beagle/virtual-pairing` in the public sidebar.
[ ] Add i18n messages for Finnish and Swedish.
[ ] Update feature docs and `CHANGELOG.md`.
[ ] Add focused tests and run targeted checks.

## Validation

- `pnpm --filter @beagle/contracts typecheck`
- `pnpm --filter @beagle/server test -- dogs/virtual-pairing`
- `pnpm --filter @beagle/server test -- admin/dogs/virtual-pairing`
- `pnpm --filter @beagle/db test -- dogs/virtual-pairing`
- `pnpm --filter @beagle/web test -- virtual-pairing`
- `pnpm --filter @beagle/web typecheck`
- Manual browser check: `/beagle/virtual-pairing` on mobile width and desktop width.
- Manual browser check: unauthenticated search, select sire/dam, calculate, swap, SP change, and position toggle.
- Manual privacy check: inspect public API JSON and confirm no Lafora, PUR, admin diagnostics, debug placeholders, or internal health data.

## Open questions

- Should v1 public search "Koko (kpl)" be implemented now, or is the Linear-listed show/test count parity sufficient?
- Should virtual pedigree be added in a later slice, or is it out of scope for BEJ-124 entirely?
- Should public name search preserve current v2 substring/wildcard behavior, or match v1 prefix `LIKE "name%"` behavior exactly?
