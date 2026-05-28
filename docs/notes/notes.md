# Working Notes

Date: 2026-05-26

## PANUN TURO EPI Mismatch

Case:

- Dog: `PANUN TURO`
- Registration: `FI25177/15`
- v2 EPI: `0.53125` -> displays as `0.5313`
- v1 EPI: `0.59375` -> displays as `0.5938`
- Delta: `0.0625` (`1/16`)

What was verified locally with `pass-cli` against the local v2 Postgres DB and the legacy MariaDB dump:

- The mismatch is not caused by a missing stored disease row in v2.
- The mismatch is caused by the imported pedigree slice and how the calculator reaches legacy disease facts.

Verified legacy-only fact set:

- The real missing PANUN TURO row is `EPI_1/94 | SF14404/90 | SF19531/89 | epi`.
- Adding that row to the calculator input with `dogId = null` and the resolved parent links changes PANUN TURO from `0.53125` to `0.59375`.
- All five of the previously skipped `beasairaat` rows have resolvable sire/dam links.
- The `nik` and `muu` rows do not affect the current numeric calculations, but they are still part of the v1 disease-list data and should be preserved.

Important distinction:

- This is not "row missing in v2 tables."
- This is "row present or recoverable, but not represented in the imported v2 pedigree slice in a way the calculator can use."

Useful code references:

- `packages/db/dogs/core/pedigree-ancestry.ts`
- `packages/server/dogs/core/disease-summary.ts`
- `packages/server/admin/dogs/profile/get-admin-dog-profile.ts`

Open follow-up if needed:

- Compare the remaining legacy disease-list rows to the imported v2 pedigree to find any other rows that should be preserved with fallback identity handling.

## Legacy Disease Parent-Link Warnings

Observation from phase1.25 import warning review:

- Rows with messages like `beasairaat dam registration did not resolve to DogRegistration` are not skipped rows.
- They are present in `KoiranSairaus`, but one or both parent relation fields may be null.
- In the checked warning set, all requested legacy IDs were imported: `57/57`.
- The affected dog usually resolved by `registrationNo`; examples with unresolved parent links include `FI15813/15`, `FI42764/17`, `PKR.VI-14158`, `PKR.VI-16409`, `NO*`, `DK*`, `SE*`, `ANKC*`, and `AKCHP*` rows.
- The warning set contained mostly `mls_t` rows and some `lepit`/`lepik` rows.
- No EPI row was identified in this parent-resolution warning set.

Important distinction:

- This is separate from skipped synthetic/missing `REKNO` rows such as `EPI_1/94`.
- Synthetic/missing `REKNO` rows were skipped before fallback identity handling.
- Parent-link warning rows were already imported, but their `isaDogId` and/or `emaDogId` may be null.

Why this may matter:

- `mls_t` is not part of current EPI/PUR/Lafora/risk calculations.
- `lepit`/`lepik` rows can affect Lafora when the affected dog itself is in the loaded health graph.
- Missing parent links can matter for future disease-list/profile parity and for any calculator logic that depends on sibling/parent/offspring evidence through `isaDogId`/`emaDogId`.

Possible next investigation:

- Query unresolved parent registrations from `ImportRunIssue`.
- Compare them against legacy `bearek_id`, `samakoira`, and imported `DogRegistration` aliases.
- Add alias normalization or missing parent-dog import rules only when source identity is unambiguous.
- Keep the warnings searchable until parent-link cleanup is intentionally handled.
