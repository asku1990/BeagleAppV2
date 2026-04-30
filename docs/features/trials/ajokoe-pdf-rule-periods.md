# AJOK PDF rule periods

This document tracks AJOK PDF availability by rule period. It intentionally
does not define field mapping for any single pöytäkirja renderer.

## Rule-period availability

- `trw_pre_20020801`: not implemented.
- `trw_range_2002_2005`: not implemented.
- `trw_range_2005_2011`: implemented through the `legacy-2005-2011` renderer
  skeleton. The current renderer fills the core header, dog details, driving
  time, merit points, loss-point, final-points, and note sections while
  coordinates are tuned section by section.
- `trw_post_20110801`: implemented through the `legacy-2011-2023` renderer.
  Field mapping and renderer details are documented in
  `docs/features/trials/ajokoe-koirakohtainen-poytakirja-2011-2023.md`.
- `trw_post_20230801`: implemented through the `current-2023` renderer.
  The permanent 2023 template is not yet available; the renderer reuses the
  2011-2023 PDF template and identical coordinate helpers. A Finnish
  "not final" notice is drawn on every generated page until the official
  template is delivered. See BEJ-96.
- Unknown or null rule periods are unsupported.

## Runtime behavior

- The API route serves PDF bytes for rule sets with a configured template.
- Rule sets without a configured template, unknown periods, or null rule
  periods return `TRIAL_PDF_NOT_AVAILABLE`.
- The renderer must not draw fields from one rule period onto another rule
  period's template.

## Template assets

- 2005-2011 template:
  `apps/web/public/templates/ajok-poytakirja-2005-2011.pdf`
- 2011-2023 template:
  `apps/web/public/templates/ajok-poytakirja-2011-2023.pdf`
- 2023→ template (temporary copy of 2011-2023):
  `apps/web/public/templates/ajok-poytakirja-2023.pdf`
  Replace with the official 2023 template when it becomes available and
  re-verify all field coordinates for the `current-2023` renderer.

Do not modify the official current template when adding or changing legacy rule
period support.
