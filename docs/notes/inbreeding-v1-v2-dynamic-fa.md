# Inbreeding v1/v2 Dynamic Fa Notes

Date: 2026-05-24

## Case

Virtual pairing:

- Sire: `VUOPAJAN WONKALE FI43443/17`
- Dam: `TAIVALTAJAN DEJAVU FI28258/21`
- Generation depth: `SP 9`

Observed values:

- v1: `1.7821 % (1.7136 %)`.
- v2 dynamic: `1.7762 %`.

## Finding

The raw shared-ancestor basis matches between v1 and v2.

This is the intended parity target. v2 should preserve v1 behavior for shared
ancestor occurrence discovery, included/excluded occurrence rules, raw `Fx`
contribution formula, grouped ancestor contributions, and known pedigree
coverage.

For `SP 9`:

- Shared occurrences: `198` in both.
- Included occurrences: `91` in both.
- Included side positions: `I=66`, `E=53`, total `119` in both.
- Included ancestor count: `37` in both.
- Raw `Fx`: `1.713562 %` in both.

The final adjusted percentage differs because v1 uses stored legacy
`bearek_id.SIITOSASTE` values for shared ancestors' `Fa`, while v2 now
calculates ancestor `Fa` dynamically from the current pedigree graph.

This difference is intentional. v2 must always use current pedigree data for
virtual pairing, so admins do not need to save or recalculate stored
percentages before getting an up-to-date result. Imported/stored
`SIITOSASTE` values are not the source of truth for virtual-pairing
calculation.

## SP 6 Check

For the same pair at `SP 6`:

- v1 known slots: `126 / 126`, `100 %`.
- v2 known slots: `126 / 126`, `100 %`.
- Missing slots: `0`.
- Different slots: `0`.
- Raw `Fx`: `1.171875 %` in both.
- v1 adjusted: `1.225846 %`.
- v2 dynamic adjusted: `1.223755 %`.

The `SP 6` difference is explained by `ASTALAN RONJA FIN12562/97`:

- Raw contribution: `0.1953125 %`.
- v1 stored `Fa`: `2.6329041 %`.
- v2 dynamic `Fa SP6`: `1.5625 %`.
- v2 dynamic `Fa SP9`: `2.5482178 %`.

So the difference exists even when the pedigree slots are identical. It is not
caused by missing dogs for `SP 6`; it is caused by stored legacy `Fa` versus
dynamic `Fa`.

## Missing Pedigree Slots At SP 9

v2 has slightly lower known pedigree coverage for this pair:

- v1 displayed: `81.02 %`, equivalent to about `828 / 1022` slots.
- v2 measured: `825 / 1022`, `80.724 %`.

Real v1 slots missing from v2:

- `DK14863/77`, sire of `DK08567/79 CANTO`.
- `DK29183/76`, dam of `DK08567/79 CANTO`.
- `KCSB0223BF`, sire of `SOLOMAN OF DIALYNNE` / `BARON OF SARAVERE`.

Legacy also had `U000000` placeholder values in deep slots. These are not real
dogs and should not be treated as imported dog records.

## Current Interpretation

v1's final percentage is not fully current relative to the current pedigree
data, because it depends on stored `SIITOSASTE` values that may have been
calculated earlier with a different data state or generation depth.

v2 dynamic calculation is the canonical direction because the product goal is
an always up-to-date inbreeding percentage from the current pedigree data.

When reviewing legacy parity, classify differences as acceptable when:

- raw `Fx` and diagnostic basis counts match v1, and
- the remaining difference is explained by stored legacy ancestor `Fa` versus
  dynamically calculated current-data ancestor `Fa`.

Do not change virtual pairing to read stored `SIITOSASTE` unless the product
goal changes from current-data calculation to exact legacy output reproduction.

## Follow-Up Test

Next time, test in v1 whether recalculating and saving the ancestor value changes
the virtual-pairing result:

1. Open `ASTALAN RONJA FIN12562/97` in v1 hallinta.
2. Recalculate its `SIITOSASTE` with the relevant generation depth.
3. Check whether `bearek_id.SIITOSASTE` changes from `2.6329041`.
4. Re-run the virtual pairing `VUOPAJAN WONKALE FI43443/17` x
   `TAIVALTAJAN DEJAVU FI28258/21` at `SP 6` and `SP 9`.
5. Compare whether v1 moves closer to v2 dynamic values.
