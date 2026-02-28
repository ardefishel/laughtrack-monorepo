# LaughTrack Mobile v2 - Project Overview

This document covers the project at a high level: what it is, how it is structured,
how to run it, and where to look when building new features.

## Overview

LaughTrack Mobile v2 is an Expo + React Native app for managing stand-up comedy
material. The app currently includes:

- Home dashboard
- Material management flows (premise, bit, setlist)
- Notes, Premises, and Bits backed by WatermelonDB (offline/local persistence)
- Learn and Account sections (UI-level)

## Tech Stack

- Expo SDK 54 + React Native 0.81
- Expo Router (file-based routing)
- HeroUI Native + Uniwind (Tailwind-style RN styling)
- WatermelonDB (local database)
- FlashList for performant lists
- Zod for domain/app data contracts (`src/domain/*`, re-exported via `src/types.ts`)

## Getting Started

### Prerequisites

- Node.js 20+
- npm (or Bun; `bun.lock` exists in repo)
- Xcode (iOS) and/or Android Studio (Android) for native simulators

### Install dependencies

```bash
npm install
```

### Start development server

```bash
npm run start
```

### Run platform builds

```bash
npm run ios
npm run android
```

### Lint

```bash
npm run lint
```

## Project Structure

Key directories:

- `src/app`: Expo Router routes and layout groups
  - `src/app/_layout.tsx`: root providers (Gesture Handler, WatermelonDB, HeroUI, Keyboard)
  - `src/app/(app)/_layout.tsx`: app stack configuration (tabs, detail screens, modals)
  - `src/app/(app)/(tabs)`: tab-level screens (Home, Material, Learn, Account)
  - `src/app/(app)/(detail)`: detail/edit screens
  - `src/app/(app)/(modal)`: modal routes
- `src/components`: feature and shared UI components
- `src/database`: WatermelonDB setup, schema, constants, and models
- `src/config`: app/tabs/material config values
- `src/types.ts`: app-facing domain types and schemas
- `docs/features`: feature-specific docs

## Routing Notes

- Routing is file-based via Expo Router.
- Tabs are configured from `src/config/tabs.ts` and rendered by `src/app/(app)/(tabs)/_layout.tsx`.
- Detail routes use dynamic route params (for example `.../[id].tsx`).
- Modal routes are registered in `src/app/(app)/_layout.tsx` with form sheet presentations.
- For modal-to-detail state handoff, prefer explicit primitive route params plus a nonce trigger (avoid serialized JSON payload params).
- For form-sheet -> detail returns, prefer `router.dismissTo(...)` over `navigate(...)` to avoid duplicate detail screens being pushed.

## Data Layer

- Local persistence currently exists for notes, premises, and bits using WatermelonDB.
- DB is initialized in `src/database/index.ts`.
- Schema is defined in `src/database/schema.ts` (current version: `1`).
- Database provider is mounted at app root in `src/app/_layout.tsx`.
- Decorators are required by WatermelonDB and configured in `babel.config.js` and `tsconfig.json`.

For modeling architecture details, see `docs/architecture/data-modeling.md`.

For note-specific behavior and constraints, see `docs/features/note/README.md`.

## Development Conventions

- Prefer app-level types from `src/types.ts` in UI-facing code.
- Keep DB writes wrapped in `database.write(...)`.
- Keep routing and navigation aligned with route file names.
- Reuse shared components from `src/components` before introducing new primitives.

## Current Implementation Status

- Notes are integrated with local DB and support create/read/update/delete flows.
- Premises are integrated with local DB and support create/read/update/delete/search/filter flows.
- Bits are integrated with local DB and support create/read/update/delete/search/filter flows.
- Setlists are integrated with local DB and support create/read/update/delete/search/filter flows.

## Documentation Map

- Docs index: `docs/README.md`
- Project overview: `docs/project-overview.md`
- Modeling flow: `docs/architecture/data-modeling.md`
- Note feature docs: `docs/features/note/README.md`
- Premise feature docs: `docs/features/premise/README.md`
- Bit feature docs: `docs/features/bit/README.md`

Add new docs under `docs/features/<feature>/README.md` for feature-level behavior,
trade-offs, and constraints.
