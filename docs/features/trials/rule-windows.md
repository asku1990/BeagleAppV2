# Trial rule windows

## Purpose

Trial rule windows give AJOK events a persisted rule-period identity. This
document is the source of truth for the seeded timeline and for the verification
status of manual result creation.

Verification in this document is scoped to the manual create form. It is
separate from PDF renderer availability, which is documented in
[AJOK PDF rule periods](./ajokoe-pdf-rule-periods.md).

## Runtime resolution

Rule windows are inclusive date ranges stored in `trial_rule_window`. Event
creation and trial imports resolve an event date against the active ranges and
persist the selected ID in `TrialEvent.trialRuleWindowId`. The ID may be `null`
when no active range matches.

Consumers use the persisted event-owned ID. In particular, the manual result
form must not recalculate a window from the event date in the browser.

The result-create registry uses the ID to select field visibility, terminology,
Lisätiedot controls, and control-to-persistence conversion. This changes the
creation UI and how its values are expressed in the existing write format; it
does not change the backend write contract or database schema and does not add
rule-window-specific server validation.

## Verification statuses

| Rule-window ID        | Effective period   | Manual result creation                      |
| --------------------- | ------------------ | ------------------------------------------- |
| `trw_pre_20020801`    | Before 1.8.2002    | Unverified; show-all compatibility fallback |
| `trw_range_2002_2005` | 1.8.2002–31.7.2005 | Unverified; show-all compatibility fallback |
| `trw_range_2005_2011` | 1.8.2005–31.7.2011 | Unverified; show-all compatibility fallback |
| `trw_post_20110801`   | 1.8.2011–31.7.2023 | Unverified; show-all compatibility fallback |
| `trw_post_20230801`   | From 1.8.2023      | Verified for manual result creation         |

`null` and unknown IDs also use the unverified compatibility fallback.

A rule window may have an implemented PDF renderer without having a verified
manual-create field set. Do not infer one status from the other.

## `trw_post_20230801`

### Effective period

`trw_post_20230801` applies from 1 August 2023 onward. Manual result creation
selects this configuration only when the trial event's persisted
`trialRuleWindowId` has that exact value.

### Verification status

This is the only rule window currently verified for manual result creation.
The field set has been checked against the current 2023+ dog-trial PDF behavior.

### Entry fields

The verified score fields are:

- Hyväksytyt ajominuutit
- Ajoajan pisteet
- Haku
- Haukku
- Ajotaito
- Ansiopisteet yhteensä

These compatibility score fields are hidden:

- Tie ja estetyöskentely (`tja`)
- Metsästysinto (`pin`)

The existing grouped layout remains unchanged:

- Ajo
- Haku
- Haukku
- Muut

Other retained create fields—event/result metadata, loss points, status, notes,
owner snapshots, and judges—remain available. Rule-window selection does not
redesign the form.

The verified `yva` term is **Ajotaito**. Default editing and compatibility
fallback continue using **Ajotaito / yleisvaikutelma**.

### Era fields

The verified era-level fields are:

| Field             | Current create label |
| ----------------- | -------------------- |
| `alkoi`           | `alkoi`              |
| `hakumin`         | `hakumin`            |
| `ajomin`          | `ajomin`             |
| `haku`            | `haku`               |
| `hauk`            | `haukku`             |
| `yva`             | `ajotaito`           |
| `hlo`             | `hakulöysyys`        |
| `alo`             | `ajolöysyys`         |
| `huomautusTeksti` | `Huomautusteksti`    |

Era-level `tja` and `pin` are hidden. The current-rule term is Ajotaito; the
generic edit and fallback term remains Ajotaito / yleisvaikutelma.

### Lisätiedot

The verified rows, in registry order, are:

- codes `10`–`24`
- code `25`, part `a`
- code `26`
- code `27`, part `a`
- codes `30`–`37`
- codes `40`–`42`
- codes `50`–`62`

Parts `25:b`, `25:c`, `27:b`, and `27:c` are not included. The retained `a`
rows are displayed without a part suffix.

Input kinds are:

| Input kind | Codes and parts                                                           |
| ---------- | ------------------------------------------------------------------------- |
| Marker     | `10`, `11`, `13`–`16`                                                     |
| Integer    | `12`, `17`–`20`, `27:a`, `36`, `58`                                       |
| Decimal    | `21`–`24`, `25:a`, `26`, `30`–`35`, `37`, `40`–`42`, `50`–`57`, `59`–`62` |
| Text       | None currently configured                                                 |
| Tri-state  | None currently configured                                                 |

The UI groups rows as Olosuhteet, Haku, Haukku, Metsästysinto, Ajo, and Muut
ominaisuudet. Rows use the registry's `sortOrder` within those groups.
Persisted integer `jarjestys` comes from the canonical base configuration's
`persistenceOrder`; filtering parts out of the verified set does not renumber
the remaining rows.

### Persistence behavior

The registry owns create-form semantics and conversion to the existing
Lisätiedot persistence format:

- A selected verified marker persists as `"1"`.
- An unchecked verified marker maps to empty and is omitted from the write.
- Integer, decimal, and text controls use their configured input semantics and
  map to the existing string `arvo` values.
- Tri-state is available only for an explicitly configured field whose domain
  distinguishes empty, `"0"`, and `"1"`; no 2023+ row currently uses it.
- Empty Lisätiedot rows are omitted from the request.

Entry, era, and Lisätiedot request shapes remain the existing backend contract.

## Historical and unknown windows

### Compatibility fallback

Every seeded historical ID, `null`, and unknown ID currently uses one
unverified show-all compatibility fallback:

- all compatibility entry and era fields remain visible;
- generic labels remain in use, including Ajotaito / yleisvaikutelma;
- Lisätiedot rows are built from `ADMIN_TRIAL_LISATIETO_CONFIG`;
- original generic marker selects and generic inputs remain in use;
- raw values such as an explicit `"0"` are preserved;
- no current-rule semantic conversion is applied; and
- the result-create UI displays an unverified-field-set warning.

Show-all compatibility does **not** mean that a historical rule window has
been implemented correctly. It is a safe generic data-entry fallback until
authoritative historical field sets are verified.

### Verification requirements

Before marking a historical window verified, contributors must establish:

- an authoritative rule source;
- the exact entry fields;
- the exact era fields;
- period-correct terminology;
- exact Lisätiedot codes and parts;
- input and control semantics;
- control-to-persistence mapping; and
- focused registry, presentation, and serialization tests.

Do not infer historical fields from another period, from the compatibility
fallback, or solely from PDF renderer availability.

## Contributor guidance

- Treat `TrialEvent.trialRuleWindowId` as persisted event context.
- Keep rule-ID branching inside the result-create registry, not presentation
  components.
- Keep the fallback generic until a historical window completes the
  verification requirements above.
- Update this document with any verified field-set change.
- Keep import-specific projection behavior in
  [Legacy Import Phase 5](../../legacy-import/phase5-trial-runtime-projection.md)
  and PDF-specific behavior in
  [AJOK PDF rule periods](./ajokoe-pdf-rule-periods.md).

Implementation source:

- `apps/web/lib/admin/trials/result-create-field-registry.ts`
- `apps/web/lib/admin/trials/__tests__/result-create-field-registry.test.ts`
- `apps/web/lib/admin/trials/__tests__/entry-create-model.test.ts`
