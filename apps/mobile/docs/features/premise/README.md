# Premise Feature

This document describes the current premise feature implementation, including
routing, persistence, filtering behavior, and key development constraints.

For end-to-end interaction steps, see `docs/features/premise/user-flow.md`.

## Scope

Implemented flows:

- Persistent premise list (WatermelonDB-backed)
- Premise create/edit screen
- Client-side search on premise content
- Filter by status, tags, and attitude
- Swipe-to-delete on premise cards

Out of scope:

- Remote sync
- Soft delete / undo delete
- Normalized tag relationship tables (current implementation stores tags as JSON)

## Routes

- `/material/premise` -> Premise list tab (`src/app/(app)/(tabs)/material/premise.tsx`)
- `/premise/new` -> Create premise (`src/app/(app)/(detail)/premise/[id].tsx` with `id=new`)
- `/premise/:id` -> Edit premise (`src/app/(app)/(detail)/premise/[id].tsx`)
- `/premise-filter` -> Filter modal (`src/app/(app)/(modal)/premise-filter.tsx`)
- `/premise-add-bit` -> Bit picker form sheet (`src/app/(app)/(modal)/premise-add-bit.tsx`)

## Data Model

### App type

- Canonical app-facing type: `Premise` from `src/domain/premise.ts`
- Re-exported from `src/types.ts`
- Shape:
  - `id: string`
  - `content: string`
  - `status: PremiseStatus`
  - `attitude?: Attitude`
  - `tags?: PremiseTag[]`
  - `bitIds?: string[]`
  - `createdAt: Date`
  - `updatedAt: Date`

### Database model

- Watermelon model: `src/database/models/premise.ts` (`PremiseModel` in UI files)
- Table: `premises` (`src/database/constants.ts`)
- Table metadata: `src/database/premiseSchema.ts`
- Schema registration: `src/database/schema.ts`
- Columns:
  - `content` (string)
  - `status` (string, indexed)
  - `attitude` (string, nullable, indexed)
  - `tags_json` (string)
  - `bit_ids_json` (string)
  - `created_at` (number)
  - `updated_at` (number, indexed)

### Type mapping rule

UI should prefer `Premise` from `src/types.ts`.
DB operations should use Watermelon `PremiseModel`.

Shared mapping lives in `src/database/mappers/premiseMapper.ts`.

## Persistence Setup

- Database instance: `src/database/index.ts`
- Table migration: `src/database/migrations.ts` (added in schema version `2`)
- Provider mounted in root layout: `src/app/_layout.tsx`
- Adapter: SQLite (native targets only)

Important project config:

- `babel.config.js` includes decorators plugin (`legacy: true`)
- `tsconfig.json` enables `experimentalDecorators`

## Screen Behavior

### Premise list screen

File: `src/app/(app)/(tabs)/material/premise.tsx`

- Observes all premises sorted by `updated_at desc`
- Performs explicit refresh on focus to avoid stale card content after returning from edit
- Search filter runs client-side on `content`
- Applies route-param filters for `statuses`, `tags`, `attitudes`
- FAB action routes to `/premise/new`
- Supports swipe-to-delete via `PremiseCard` `onDelete`

### Premise detail screen

File: `src/app/(app)/(detail)/premise/[id].tsx`

- Uses route param `id`
  - `new`: create mode
  - otherwise: edit mode with `findAndObserve(id)`
- Save behavior:
  - edit mode: `updatePremise(...)`, then `router.back()`
  - create mode: create premise row, then `router.back()`
- Persists:
  - `content`, `status`, `attitude`
  - `tags` as JSON string array (`tags_json`)
- Shows `Updated ...` timestamp text in edit mode
- Displays connected bit count from `bitIds`
- Includes `Choose Bits` action that opens the premise bit picker form sheet

### Premise bit picker form sheet

File: `src/app/(app)/(modal)/premise-add-bit.tsx`

- Lists persisted bits with search + multi-select
- Supports creating a new bit from inside the sheet
- Returns selected values to premise detail using route params and a nonce trigger

### Form sheet return contract (dismissTo pattern)

Files: `src/app/(app)/(modal)/premise-add-bit.tsx`, `src/app/(app)/(detail)/premise/[id].tsx`

- `premise-add-bit` returns values using `router.dismissTo(...)` (not `navigate(...)`)
- Return params:
  - `id`: target premise id
  - `selectedBits`: comma-separated bit ids
  - `bitsNonce`: unique timestamp string used as apply-once trigger
- Premise detail applies updates only when `bitsNonce` exists, then clears `selectedBits` and `bitsNonce`.
- Why this pattern:
  - `dismissTo` closes the form sheet and lands on the existing detail screen instance
  - avoids pushing a duplicate `premise/[id]` screen on top of the stack
  - keeps state handoff simple with primitive params

### Premise filter modal

File: `src/app/(app)/(modal)/premise-filter.tsx`

- Status and attitude options are static enums
- Tag options are derived dynamically from persisted premises (`tags_json`)
- Applies selected filters through route params

## Deletion Behavior

Swipe action triggers permanent deletion:

- `destroyPermanently()` inside `database.write`

This is hard delete. If undo/history is required later, replace with soft-delete
fields and filtered queries.

## UI Components

- List shell: `src/components/feature/material/material-list-screen.tsx`
  - supports controlled search input via `searchValue` and `onSearchChange`
- Card UI: `src/components/feature/material/premise-card.tsx`
  - accepts `premise`, `onPress`, `onDelete?`
  - includes Swipeable right action for delete

## Known Constraints

- Native-only persistence target (iOS/Android)
- `tags` and `bitIds` are denormalized JSON arrays in premise rows
- Full-project lint/typecheck has unrelated existing issues outside premise feature

## Future Improvements

1. Normalize premise tags into dedicated tables when relational queries are needed.
2. Add optional delete confirmation or undo snackbar.
3. Add tests for create/update/delete/filter and navigation refresh behavior.
4. Add sync support if backend replication is needed.

## Dev Checklist (when touching premises)

1. Keep `src/domain/premise.ts` as the premise source of truth.
2. Keep DB writes inside `database.write(...)` blocks.
3. Update `updatedAt` on every premise mutation.
4. Verify list refresh after save/back navigation.
5. Verify search/filter behavior and swipe delete.
