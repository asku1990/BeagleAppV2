# Legacy Import Phase 1

## Purpose

Phase 1 imports foundation entities and link structures. It does not import trials or shows.

## Command

`pnpm import:phase1 [USER_ID]`

## Primary source tables

- `bearek_id`
- `kennel`
- `beaom`
- `bea_apu`
- `samakoira`

## Main writes

- `Dog`
- `DogRegistration`
- `Breeder`
- `Owner`
- `DogOwnership`
- sire/dam relations on `Dog`
- alias/canonical registration mappings via phase1 logic

## Issue profile

Typical issue groups:

- missing required fields
- invalid registration format
- missing dog relation targets
- placeholder/invalid relation registrations
- alias/canonical conflicts

Issue rows are written to `ImportRunIssue` with `kind=LEGACY_PHASE1`.

## Operational notes

- Phase 1 should be run before phase2 and phase3.
- Re-run is duplicate-safe through stable upsert/lookup behavior in current phase1 path.
