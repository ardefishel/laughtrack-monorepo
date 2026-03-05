# AGENTS.md - @laughtrack/shared-types

Shared TypeScript type definitions used by both `apps/mobile` and `apps/backend`.
Package name: `@laughtrack/shared-types`. Import via `@laughtrack/shared-types`.

## Structure

- `src/index.ts` — Re-exports all types from domain modules.
- `src/api.ts` — API payload/response helper types.
- `src/joke.ts` — `JokeStatus` and joke-related types.
- `src/joke-set.ts` — `JokeSetStatus`, `JokeSetItemType`, and set-related types.
- `src/audio.ts` — Audio recording types.

## Conventions

- Export all types from `src/index.ts` via `export * from './module'`.
- One file per domain entity. Keep types simple — interfaces, type aliases, and string unions only.
- No runtime code. This package is types-only.
- Build with `tsc`. Test/lint scripts are placeholder no-op commands.
- When adding a new domain type, create a new file in `src/`, add types, then re-export from `src/index.ts`.
