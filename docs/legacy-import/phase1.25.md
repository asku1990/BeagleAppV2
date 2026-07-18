# Legacy Import Phase 1.25

This phase imports legacy disease data after phase1 has created canonical dogs
and registrations, and before phase1.5 imports titles.

## Command

`pnpm import:phase1.25 [USER_ID]`

## Source tables

- `beasairaudet` imports disease definitions into `Sairaus`.
- `beasairaat` imports dog disease rows into `KoiranSairaus`.

## Relationship rules

- Dog identity and anonymous source parent registrations are resolved through
  `DogRegistration.registrationNo`.
- Imported rows store v2 dog ids when `REKNO` resolves. For these real dog
  disease rows, canonical calculation parentage comes from `Dog.sireId` and
  `Dog.damId`.
- Imported disease rows keep the row dog's raw legacy registration number as
  `rekisterinumero` for traceability.
- Imported disease rows also preserve normalized source `ISREK` and `EMREK` as
  raw registration fields for traceability and anonymous litter matching. For
  `DOG` evidence these source parent fields are ignored by calculations.
- Each imported row stores an explicit evidence kind:
  - `DOG`: valid `REKNO` resolves to a real dog.
  - `LITTER`: missing, generated, synthetic, or invalid `REKNO` with both
    source parent registrations resolving.
- Synthetic or missing `beasairaat.REKNO` values are preserved with a null
  `dogId` only when both source parent registrations resolve, so anonymous
  affected puppy/litter evidence can be used by EPI/PUR calculations.
- Valid `REKNO` values that do not resolve are normally not stored in
  `KoiranSairaus`; they are recorded as skipped import issues for manual
  cleanup.
- The known legacy row `ID=270 / FIN001/07` is an explicit exception: it is
  imported with its original registration as `LITTER` evidence when both
  source parents resolve.
- Rows that cannot become `DOG` or `LITTER` do not fail the import, but they are
  skipped from `KoiranSairaus` and recorded as issues.
- Disease registration issues state whether the row was imported as `LITTER`
  evidence or skipped. Import summary counters include only rows that reached
  the corresponding outcome.

## Data rules

- `Sairaus.sairausRyhma` is derived from `beasairaudet.SAIRAUS`.
- No other legacy source tables are imported by this phase.

## Implementation references

- Phase use-case: `packages/server/imports/phase1_25/run-legacy-phase1_25.ts`
- Source loader: `packages/db/imports/phase1_25/source.ts`

Phase 1.25 belongs to the same one-shot bootstrap/migration flow as
phase1/1.5/2/3/5.
