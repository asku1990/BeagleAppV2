# Public Virtual Pairing

The public virtual pairing surface lets visitors search for dogs, select a sire
and dam, and calculate a current-data pairing result without exposing admin-only
health diagnostics.

## Scope

- Route: `/beagle/virtual-pairing`
- Search by one active field at a time: `EK-numero`, `Rekisterinumero`, or `Nimi`
- Search results show EK, registration number, sex, name, trial count, and show count
- Parent selection uses separate sire and dam actions
- Calculation reuses the shared current-data inbreeding and health services
- Result presentation shows the adjusted inbreeding coefficient, raw `Fx` only when it differs, known pedigree percentage, EPI risk, risk number, and grouped basis rows
- Optional position display shows all included sire/dam positions per shared ancestor
- `epi-info` opens a public explanation page instead of an admin popup

## Boundary rules

- Public responses must not include Lafora, PUR, internal diagnostics, or placeholder sections
- Public UI must not import `packages/server` or `packages/db`
- Public search and calculation stay in `packages/server/dogs/virtual-pairing`
- Shared inbreeding grouping preserves all included occurrences so the public result can show every position for an ancestor

## Related files

- `apps/web/app/(public)/beagle/virtual-pairing/page.tsx`
- `apps/web/app/(public)/beagle/virtual-pairing/epi-info/page.tsx`
- `apps/web/components/beagle-virtual-pairing/*`
- `apps/web/app/actions/public/beagle/dogs/virtual-pairing/*`
- `apps/web/queries/public/beagle/dogs/virtual-pairing/*`
- `apps/web/lib/public/beagle/dogs/virtual-pairing/*`
- `packages/contracts/dogs/virtual-pairing/*`
- `packages/server/dogs/virtual-pairing/*`

## Tests

- `packages/server/dogs/virtual-pairing/__tests__/*`
- `packages/server/dogs/core/__tests__/inbreeding-coefficient.test.ts`
- `apps/web/lib/public/beagle/dogs/virtual-pairing/__tests__/*`
