# Sidebar

Developer notes for the app sidebar components in this folder.

## Layout defaults

- Sidebar is expanded by default on desktop layouts.
- Keep profile block and auth actions compact so navigation remains the visual priority.

## Main navigation rule

- Show only real, navigable destinations in the main sidebar.
- Do not render unfinished features as clickable placeholder items.

## Availability model

- Keep future sidebar entries in the nav config with an explicit availability state.
- Render only entries marked as enabled in the main public navigation.
- This keeps planned items visible in code without exposing dead-end links in the UI.

## Naming

- Use one naming style for visible sidebar labels.
- Prefer section-style labels over action-style labels in the sidebar.
- Example: `Beaglet`, `Koetulokset`, `Näyttelyt` instead of mixing section names with `...haku` labels.

## Legacy data testing

- If old and new database sources need to be tested in parallel, add the choice inside the relevant feature page or query flow.
- Do not duplicate sidebar entries just to expose database source variants.

## When to update this doc

- Update this file when sidebar visibility rules, naming conventions, or environment/feature-flag behavior change.
