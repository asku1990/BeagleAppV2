# Paras ajuri -kilpailu

The public `/beagle/best-driver` page calculates the Paras ajuri competition
ranking directly from canonical `TrialEntry`, `TrialEvent`, and linked
normal-dog data. The feature belongs to the `competitions` domain and uses trial
records as source data; it does not persist or rebuild the legacy `parasajuri`
helper table.

## Competition rules

For a selected season, a dog qualifies when its highest-scoring valid set of
three results totals at least 150 points and satisfies all of these conditions:

- at least one result is on bare ground (`ke = P`);
- the results cover at least two identified kennel district numbers. The
  canonical identifier is `kennelDistrictNo`; district names are not used as
  a fallback, and missing, invalid, or `00` numbers are unidentified;
- at most one result has the structured type `KOKOKAUDENKOE`.

Only seasons from 2016–17 onward are supported, matching v1. Older inferred
seasons are omitted from the season selector and direct requests for them are
rejected.

The date window intentionally matches v1 exactly: the event date must be after
1 August of the starting year and before 1 March of the following year. Events
on the boundary dates themselves are excluded.

## Intentional legacy correction

V1 walked score-sorted rows greedily, so it could miss a higher-scoring valid
combination when weather and district constraints interacted. V2 evaluates all
three-result combinations and chooses the highest-scoring valid one. It also
uses the structured `KOKOKAUDENKOE` type for the whole-season limit instead of
the legacy placement-string heuristic, which also treated long trials as
whole-season trials.
