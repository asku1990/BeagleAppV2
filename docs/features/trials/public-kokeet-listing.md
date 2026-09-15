# Public kokeet listing

Developer notes for the public `/beagle/trials` listing.

## Filtered YHTEENVETO

The listing also renders a filtered `Yhteenveto` section before the long-term
`Palkintosijajakauma`. It uses the active year or date-range filter and is
calculated across every matching trial entry, not only the current result page.

The section shows unique trial count, result-entry count, and counts plus
percentages for awarded entries, ranks 1-3, no prize (`0`), withdrawn (`L`),
and excluded (`S`). Percentages use all matching result entries as the
denominator. Empty searches omit the section.

## PALKINTOSIJA comparison

The listing renders a separate `Palkintosijajakauma` section after the paginated
event rows. It mirrors the `P A L K I N T O S I J A kpl(%)` long-trial comparison
on the public v1 `kokeetall.php` page and is independent of the selected listing
year or date range.

The comparison includes canonical trial entries dated on or after 20 August
2005 and groups them as follows:

- Imported `LEGACY_AKOEALL` entries use the original `SIJA` stored in
  `TrialEntry.raakadataJson`: a `PK` prefix means `Kahden viikon`, any other
  non-null value means `Yksipäiväinen`, and a null value is excluded from both.
- Native v2 entries use `TrialEntry.koetyyppi`: `PITKAKOE` means `Kahden
viikon`, while the other types mean `Yksipäiväinen`.

Columns `1`, `2`, `3`, `0`, `L`, and `S` count exact `TrialEntry.pa` values.
`Palk` is the sum of `1`, `2`, and `3`. `Yht` counts every entry in the group,
including entries with a missing or unrecognized `pa`, and is the denominator
for every percentage. Percentages are displayed with two decimal places.

The database performs the grouping and counting, the trials server maps counts
to the public DTO and derives percentages, and the web layer only formats and
renders the result. The dog-specific `Kokeet laaja` `YHTEENVETO` uses different
rules and modules.

## Tests

- DB query and mapping: `packages/db/trials/__tests__/repository.test.ts`
- Server DTO mapping: `packages/server/trials/__tests__/service.test.ts`
- Web summary rendering: `apps/web/components/beagle-trials/__tests__/beagle-trials-award-summary.test.ts`
- Listing composition: `apps/web/components/beagle-trials/__tests__/beagle-trials-page.test.ts`
- Filtered summary aggregation: `packages/db/trials/get-beagle-trial-search-summary.ts`
- Filtered summary mapping: `packages/server/trials/internal/map-beagle-trial-search-summary.ts`
