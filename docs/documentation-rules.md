# Documentation Rules

This document defines the default documentation placement rules for this repository.

## When docs are required

- Update documentation when you change behavior, contracts, architecture, operations, or other non-obvious implementation intent.
- `CHANGELOG.md` is for user-visible changes.
- Developer-facing documentation is still required when contributors need context that is not obvious from code and tests alone.

## Where docs go

- `docs/features/*` for cross-layer feature behavior.
- Nearby feature or module `README.md` for folder-local behavior.
- Other focused docs under `docs/` for broader operational or project-wide topics.
- Concise code comments only for non-obvious local context.

- Keep one source of truth per concern.
- Do not document the same behavior in both `docs/features/*` and a folder-local `README.md`.
- If a contract, integration, or workflow changes, update the corresponding doc in the same change when practical.
- Follow-up work not done now goes in `docs/tech-debt.md`.

## When no extra docs are needed

- Small local fixes with obvious behavior usually do not need extra docs beyond code and tests.

## Code comments

Use code comments sparingly. Good reasons include:

- non-obvious mapping or normalization
- intentional field exclusion
- temporary constraint or compatibility behavior
- business rule that is not obvious from the code alone

- For non-obvious function, mapper, formatter, and use-case files, add a brief 1-2 line responsibility comment when the file name alone is not enough context.
