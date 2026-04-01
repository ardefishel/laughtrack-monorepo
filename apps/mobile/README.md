# LaughTrack Mobile

Expo + React Native app for managing stand-up comedy material. Local-first with WatermelonDB.

## Tech Stack

- Expo SDK 54 + React Native 0.81
- Expo Router (file-based routing)
- HeroUI Native + Uniwind (Tailwind-style RN styling)
- WatermelonDB (local database, schema version 3)
- FlashList for performant lists
- Zod for domain data contracts

## Getting Started

```bash
# From monorepo root
bun install
bun run mobile        # Start Expo dev server
bun run mobile:ios    # Run on iOS simulator
bun run mobile:android # Run on Android emulator
bun run mobile:test   # Run mobile unit tests
```

## Project Structure

See [docs/project-overview.md](docs/project-overview.md) for full details.

- `src/app/` — Expo Router routes and layout groups
- `src/features/` — Feature-owned modules (components, hooks, services)
- `src/components/ui/` — Shared UI primitives
- `src/database/` — WatermelonDB schema, models, mappers, sync utilities
- `src/domain/` — Zod schemas for domain contracts
- `src/config/` — App and tab configuration
- `src/lib/` — Shared platform/app infrastructure
- `src/types.ts` — App-facing domain type re-exports

## Documentation

- [Project Overview](docs/project-overview.md) — Architecture, setup, structure
- [Data Modeling](docs/architecture/data-modeling.md) — Domain ↔ DB modeling flow
- [Feature Docs](docs/) — Per-feature implementation and constraints
