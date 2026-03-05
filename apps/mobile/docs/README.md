# Documentation

This folder is organized by intent so docs are easier to scan and maintain.

## Structure

- `docs/project-overview.md` - high-level project context, setup, and architecture map
- `docs/architecture/data-modeling.md` - canonical domain <-> DB modeling flow
- `docs/features/` - feature-specific implementation docs
  - `docs/features/note/README.md`
  - `docs/features/note/user-flow.md`
  - `docs/features/premise/README.md`
  - `docs/features/premise/user-flow.md`
  - `docs/features/bit/README.md`
  - `docs/features/bit/user-flow.md`
  - `docs/features/setlist/README.md`
  - `docs/features/setlist/user-flow.md`

## Naming Conventions

- Use `docs/features/<feature>/README.md` for implementation and constraints.
- Use `docs/features/<feature>/user-flow.md` for end-to-end user flow.
- Keep cross-cutting architecture docs in `docs/architecture/`.
- Prefer explicit names (`features`, `architecture`, `user-flow`) over abbreviations.

## Authoring Guidelines

- Keep feature docs focused on current behavior and constraints.
- Keep architecture docs reusable and feature-agnostic.
- Update doc links when moving files.
