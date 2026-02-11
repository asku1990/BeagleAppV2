# Plan

We will design and implement a new `apps/web` main page and menu shell first, using the legacy Beagle information architecture as input while modernizing layout, typography, and interaction states. The approach is phase-based: lock design spec and tokens first, implement only the shell (no feature content rewrites), then validate responsive behavior and accessibility before extending further.

## Current state

- Observed:
- `apps/web/app/page.tsx` is currently a minimal starter page with auth/import status and auth links.
- `apps/web/app/(admin)/layout.tsx` is a simple heading + gate wrapper, with no shared navigation shell.
- `apps/web/app/globals.css` uses default/light-dark variables and generic font stack; no product-specific UI tokens.
- Legacy app (`../beagleAppV1`) uses a left menu + main content frame layout with key sections in `h_tietokanta.php` and intro/stat content in `dbmain.php`.
- Constraints/risks:
- Must keep architecture boundaries (web-only UI work; no server/db imports into web).
- Must keep blast radius small and avoid accidental functional changes outside main page/menu shell.
- Placeholder menu routes may not exist yet, so menu items need safe non-breaking targets/states.
- Unknowns:
- Preferred default language for labels (EN vs FI/SV) in the first UI iteration.
- Whether menu shell should be reused immediately in admin routes or only homepage first.

## Assumptions

- First iteration uses English labels for clarity, while preserving legacy section naming intent.
- This phase includes visual shell and menu interactions only; data modules behind menu items are out of scope.

## Scope

- In:
- Redesign homepage layout and menu system in `apps/web`.
- Define reusable visual tokens (color, spacing, typography, focus states) for this shell.
- Implement responsive behavior for mobile and desktop.
- Out:
- Backend/API changes.
- Business logic or content feature implementation behind menu entries.
- Full multi-page IA refactor beyond homepage/admin shell.

## Existing examples (if found)

- Legacy menu source and section naming: `../beagleAppV1/h_tietokanta.php`.
- Legacy intro/main page structure: `../beagleAppV1/dbmain.php`.
- Existing web route shells: `apps/web/app/page.tsx`, `apps/web/app/(admin)/layout.tsx`.

## Plan artifact

- `docs/planning/main-page-menu-ui-redesign.md`

## Changelog

- `CHANGELOG.md`: add entry "## [Unreleased] - Redesign web main page and menu shell (files: `apps/web/app/page.tsx`, `apps/web/app/(admin)/layout.tsx`, `apps/web/app/globals.css`, `CHANGELOG.md`)"

## Files to touch

- `apps/web/app/page.tsx`
- `apps/web/app/(admin)/layout.tsx`
- `apps/web/app/globals.css`
- `CHANGELOG.md`

## Phased steps (optional)

Phase 0: Design alignment and shell specification

- Checkpoint: approved layout wireframe, menu taxonomy, and token direction before code edits.

Phase 1: Homepage shell implementation

- Checkpoint: responsive left-menu + main content shell implemented on `/` with hover/focus/active states.

Phase 2: Admin shell parity

- Checkpoint: `/admin` adopts matching top/side navigation shell while preserving `AdminGate` behavior.

Phase 3: Polish and validation

- Checkpoint: visual QA complete for desktop/mobile, keyboard navigation and target sizing validated.

## Action items

[ ] Confirm final label language and menu naming for v1 shell.
[ ] Draft homepage structure: header, menu block, status/content cards, action row.
[ ] Define and add CSS tokens in `apps/web/app/globals.css` for colors, focus, spacing, and surface styles.
[ ] Implement menu and layout in `apps/web/app/page.tsx` with accessible semantics and touch-safe targets.
[ ] Apply consistent shell styling to `apps/web/app/(admin)/layout.tsx` without changing auth logic.
[ ] Add/update `CHANGELOG.md` entry under `## [Unreleased]` listing touched files.
[ ] Run targeted checks for `apps/web` (`pnpm --filter @beagle/web lint` and `pnpm --filter @beagle/web typecheck`).
[ ] Perform manual viewport checks (mobile and desktop) and keyboard-only navigation review.

## Validation

- Run `pnpm --filter @beagle/web lint`.
- Run `pnpm --filter @beagle/web typecheck`.
- Run `pnpm --filter @beagle/web dev` and verify `/` and `/admin` at mobile + desktop widths.
- Verify keyboard focus visibility and 44px minimum interactive target height for menu items.

## Open questions

- Should first-release labels be English only, or support Finnish/Swedish labels from day one?
- Do you want `/admin` to share the exact same menu list or an admin-specific subset now?
- Should unresolved menu items be shown as disabled states or link to placeholder routes?
