# Ajokokeet laaja

Developer notes for the public dog-specific `Kokeet laaja` page.

## Purpose

- Show all public AJOK trial rows for one dog on a dedicated page.
- Keep the compact dog profile trial card as the preview and use this page for detailed inspection.
- Mirror the v1 dog-specific `Kaikki koetulokset` view where practical, including the `YHTEENVETO` block below the trial rows.

## Data flow

1. The web route `/beagle/dogs/[dogId]/kokeet-laaja` loads `/api/beagle/dogs/[dogId]/trials`.
2. `packages/server` resolves the dog identity and dog-scoped trial rows.
3. `packages/db` loads summary source rows for the selected dog and grouped `KOKO ROTU` aggregates.
4. `packages/server` builds the `BeagleDogTrialsSummaryDto`.
5. `apps/web` renders the trial rows, optional era rows, PDF stack link, and `YHTEENVETO`.

The dog profile only links to `Kokeet laaja` when trial rows exist. The direct page/API path still returns a valid empty summary for dogs with no trials.

## YHTEENVETO groups

The summary is rendered below the trial rows. Each group uses the same filter for the selected dog row and the `KOKO ROTU` row.

| DTO field         | V1 heading       | Filter                  |
| ----------------- | ---------------- | ----------------------- |
| `allTrials`       | Kaikki kokeet    | all trial rows          |
| `drivenTrials`    | Ajoon johtaneet  | `yva > 0`               |
| `noPrize`         | Ei palkintosijaa | `pa = "0"`              |
| `prizePlacements` | Palkintosijoille | `pa IN ("1", "2", "3")` |
| `interrupted`     | Keskeytyneet     | `pa IN ("L", "S")`      |

`pa` is the legacy AJOK prize/result code from the imported trial entry. The dog row is omitted for a group when the selected dog has no matching rows. The `KOKO ROTU` row can still render for that group.

## Aggregate Rules

| Column      | Rule                                                                   |
| ----------- | ---------------------------------------------------------------------- |
| Count       | number of rows in the group                                            |
| Pisteet     | average of `piste`; missing values count as `0` for v1 parity          |
| Haku        | average of `haku`; missing values are ignored                          |
| Haukku      | average of `hauk`; missing values and `0` are ignored                  |
| Ajotaito    | average of `yva`; missing values and `0` are ignored                   |
| Hakulöysyys | average of `hlo`; missing values are ignored                           |
| Ajolöysyys  | average of `alo`; missing values are ignored                           |
| Mi          | average of `pin` only for `trw_range_2005_2011`                        |
| PMi         | average of `pin` only for `trw_pre_20020801` and `trw_range_2002_2005` |

`KOKO ROTU` aggregates are calculated in the database with grouped SQL and `ROUND(AVG(...), 2)`. Dog-specific aggregates are calculated in `packages/server` from the selected dog's source rows and formatted with two decimals in the UI.

The MI/PMI split follows the current v2 trial rule-window mapping. Do not change the rule-window behavior while working on presentation or documentation fixes.

## Layer Ownership

- `packages/db`: persistence queries and efficient grouped `KOKO ROTU` aggregate reads.
- `packages/server`: business rules, dog-specific grouping, aggregate DTO shaping, and empty-summary fallback.
- `apps/web`: rendering order, labels, responsive table layout, copy/link controls, and local UI state only.

Business logic for summary membership and aggregate semantics belongs in `packages/server` or lower. The web layer should not infer group membership from raw rows.

## V1 Parity Notes

- The v1 reference is the dog-specific `Kaikki koetulokset` / `YHTEENVETO` behavior, not the admin-only yearly listing summary.
- V1 shows the summary below the result rows, with dog and `KOKO ROTU` rows under each group heading.
- Small numeric differences can exist when v2 source data or rule-window interpretation differs from v1 legacy SQL.

## Tests

- DB aggregate query coverage: `packages/db/trials/__tests__/repository.test.ts`
- Server summary grouping and mapping: `packages/server/dogs/profile/internal/__tests__/beagle-dog-trials-summary.test.ts`
- Server page/API behavior: `packages/server/dogs/profile/__tests__/get-beagle-dog-trials.test.ts`
- Web rendering: `apps/web/components/beagle-dog-profile/__tests__/dog-profile-trials-laaja-page.test.ts`
