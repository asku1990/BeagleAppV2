# Beagle Dog Profile

Developer notes for the public beagle dog profile feature.

## Primary purpose

- The page is a dog-centric detail view.
- The main user task is to inspect one dog's identity, lineage, and results.

## Main files

- `apps/web/components/beagle-dog-profile/beagle-dog-profile-page.tsx`: top-level page composition
- `apps/web/components/beagle-dog-profile/beagle-dog-profile-page-container.tsx`: query state, loading, and error handling
- `apps/web/components/beagle-dog-profile/dog-profile-details-card.tsx`: identity and basic metadata
- `apps/web/components/beagle-dog-profile/dog-profile-lineage-card.tsx`: parent links and pedigree tree
- `apps/web/components/beagle-dog-profile/dog-profile-shows-card.tsx`: show results
- `apps/web/components/beagle-dog-profile/dog-profile-trials-card.tsx`: trial results
- `apps/web/components/beagle-dog-profile/dog-profile-siblings-card.tsx`: sibling list from one birth litter
- `apps/web/app/actions/public/beagle/dogs/profile/get-dog-profile.ts`: public profile action
- `packages/server/dogs/profile/get-beagle-dog-profile.ts`: service-level profile mapping
- `packages/db/dogs/profile/get-beagle-dog-profile.ts`: DB profile assembly entrypoint

## Data flow

1. The page container fetches profile data through the public profile query/action path.
2. The server dogs profile service combines:
   - base dog profile data from the dogs DB profile module
   - show rows from the shows domain
   - trial rows from the trials domain
3. The web page renders the profile as separate cards for details, lineage, siblings, litters, shows, and trials.
4. Siblings are resolved in DB from one reliable birth litter and rendered after lineage.
5. Litters are rendered between siblings and result sections.

## Current contract rules

The public dog profile contract includes:

- basic identity fields
- parent and pedigree data
- `shows[]`
- `trials[]`
- `offspringSummary`
- `litters[]`
- `siblingsSummary`
- `siblings[]`

Current note:

- grouped litter data is already part of the profile contract and backend mapping
- the UI renders litters as grouped pentue blocks with summary counts, co-parent links, and puppy profile links
- each litter uses the shared desktop/mobile listing pattern instead of a custom flat row list
- puppy rows currently include registration number, name, sex, EK number, trial count, show count, litter count, and a placeholder color column
- siblings use the same row columns/pattern as litter puppy rows, without litter-group blocks

## Sibling resolution rules

Siblings are resolved from the profile dog's own birth litter using:

1. `birthDate + sire.id + dam.id`
2. fallback when one parent id is missing: parent registration number (same primary registration normalization as litters logic)
3. if a reliable litter identity cannot be formed, return no siblings

Additional sibling constraints:

- exclude the profile dog itself
- order siblings by registration number ascending, fallback by name ascending

## Litter grouping rules

Profile offspring is grouped into litters using:

1. `birthDate + otherParent.id`
2. fallback: `birthDate + otherParent.registrationNo`
3. fallback: `birthDate + unknown`

The co-parent depends on the profile dog sex:

- female profile dog: use puppy `sire`
- male profile dog: use puppy `dam`
- unknown sex: merge both directions and dedupe by puppy `id`

Ordering:

- litters newest first
- puppies inside a litter sorted by registration number ascending
- fallback puppy sort by name ascending

## Render rules

- Keep the page header focused on dog identity: name and primary registration number
- keep details, lineage, siblings, litters, shows, and trials as separate cards
- keep unknown/missing data visible as explicit fallback values instead of collapsing the row unpredictably
- parent links should remain the primary navigation path inside pedigree/profile content
- render siblings as one flat list card (same columns as litter puppy rows)
- render offspring as litters, not a flat child list
- place the siblings card after lineage
- place the litters card after siblings and before shows/trials
- inside each litter, render puppy rows with the same desktop/mobile responsive result split used elsewhere in the app

## Error and loading behavior

- unknown dog ids render the profile not-found state
- other fetch failures render the generic error panel
- loading uses skeleton placeholders at header and card level

## Tests

- profile page rendering: `apps/web/components/beagle-dog-profile/__tests__/beagle-dog-profile-page.test.ts`
- action contract: `apps/web/app/actions/public/beagle/dogs/profile/__tests__/get-dog-profile.test.ts`
- DB grouping/mapping: `packages/db/dogs/profile/__tests__/get-beagle-dog-profile.test.ts`
- service mapping: `packages/server/dogs/__tests__/service.test.ts`

## When to update this doc

- Update this file when profile card composition changes.
- Update this file when the dog profile contract changes.
- Update this file when litter grouping, ordering, or render rules change.
