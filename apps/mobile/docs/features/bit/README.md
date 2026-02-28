# Bit Feature

This document describes the current bit feature implementation, including
routing, persistence, filtering behavior, and key development constraints.

For end-to-end interaction steps, see `docs/features/bit/user-flow.md`.

## Scope

Implemented flows:

- Persistent bit list (WatermelonDB-backed)
- Bit create/edit screen with rich-text editor
- Metadata editing for status, tags, and linked premise
- Client-side search on bit content
- Filter by status, tags, and premise connectivity
- Swipe-to-delete on bit cards
- Setlist "add bit" picker backed by persisted bits

Out of scope:

- Remote sync
- Soft delete / undo delete
- Creating/editing premise records from bit metadata modal (current flow links existing premises only)

## Routes

- `/material/bit` -> Bit list tab (`src/app/(app)/(tabs)/material/bit.tsx`)
- `/bit/new` -> Create bit (`src/app/(app)/(detail)/bit/[id].tsx` with `id=new`)
- `/bit/:id` -> Edit bit (`src/app/(app)/(detail)/bit/[id].tsx`)
- `/bit-filter` -> Filter modal (`src/app/(app)/(modal)/bit-filter.tsx`)
- `/bit-meta` -> Metadata modal (`src/app/(app)/(modal)/bit-meta.tsx`)
  - Registered as Expo Router `formSheet` in `src/app/(app)/_layout.tsx`

## Data Model

### App type

- Canonical app-facing type: `Bit` from `src/domain/bit.ts`
- Re-exported from `src/types.ts`
- Shape:
  - `id: string`
  - `content: string`
  - `status: BitStatus`
  - `tags?: PremiseTag[]`
  - `premiseId?: string`
  - `setlistIds?: string[]`
  - `createdAt: Date`
  - `updatedAt: Date`

### Database model

- Watermelon model: `src/database/models/bit.ts` (`BitModel` in UI files)
- Table: `bits` (`src/database/constants.ts`)
- Table metadata: `src/database/bitSchema.ts`
- Schema registration: `src/database/schema.ts`
- Columns:
  - `content` (string)
  - `status` (string, indexed)
  - `tags_json` (string)
  - `premise_id` (string, nullable, indexed)
  - `setlist_ids_json` (string)
  - `created_at` (number)
  - `updated_at` (number, indexed)

### Type mapping rule

UI should prefer `Bit` from `src/types.ts`.
DB operations should use Watermelon `BitModel`.

Shared mapping lives in `src/database/mappers/bitMapper.ts`.

## Persistence Setup

- Database instance: `src/database/index.ts`
- Provider mounted in root layout: `src/app/_layout.tsx`
- Adapter: SQLite (native targets only)

Important project config:

- `babel.config.js` includes decorators plugin (`legacy: true`)
- `tsconfig.json` enables `experimentalDecorators`

## Screen Behavior

### Bit list screen

File: `src/app/(app)/(tabs)/material/bit.tsx`

- Observes all bits sorted by `updated_at desc`
- Performs explicit refresh on focus to avoid stale card content after returning from edit
- Search filter runs client-side on `content`
- Applies route-param filters for `statuses`, `tags`, `hasPremise`
- FAB action routes to `/bit/new`
- Supports swipe-to-delete via `BitCard` `onDelete`

### Bit detail screen

File: `src/app/(app)/(detail)/bit/[id].tsx`

- Uses route param `id`
  - `new`: create mode
  - otherwise: edit mode with `findAndObserve(id)`
- Save behavior:
  - edit mode: `updateBit(...)`, then `router.back()`
  - create mode: create bit row, then `router.back()`
- Persists:
  - `content`, `status`
  - `tags` as JSON string array (`tags_json`)
- Uses `react-native-enriched` editor for content input
- Header includes:
  - `Meta` action to open bit metadata modal
  - `Save/Create` action to persist the bit
- Shows linked premise banner at the top when `premiseId` exists
- Applies metadata changes returned from `bit-meta` via route params (`metaStatus`, `metaTags`, `metaPremiseId`) gated by `metaNonce`

### Bit filter modal

File: `src/app/(app)/(modal)/bit-filter.tsx`

- Status options are static enum values
- Tag options are derived dynamically from persisted bits (`tags_json`)
- Premise filter supports All / Has Premise / No Premise
- Applies selected filters through route params

### Bit metadata modal

File: `src/app/(app)/(modal)/bit-meta.tsx`

- Edits bit `status` and `tags`
- Lets user connect/disconnect a premise
- Uses form-sheet dismissal (`router.back()`) and returns selected metadata through route params on the bit detail route

### Bit metadata return contract (form sheet)

Files: `src/app/(app)/(modal)/bit-meta.tsx`, `src/app/(app)/(detail)/bit/[id].tsx`

- `bit-meta` returns values using route params instead of JSON payload blobs:
  - `metaStatus`: selected `BitStatus`
  - `metaTags`: comma-separated tags
  - `metaPremiseId`: selected premise id (empty string means no premise)
  - `metaNonce`: unique timestamp string used as an apply-once trigger
- Bit detail applies updates only when `metaNonce` is present, then clears all `meta*` params immediately.
- This avoids stale/replayed modal state when reopening the form sheet and keeps both create (`/bit/new`) and edit (`/bit/:id`) flows stable.

### Premise-bit relation sync

File: `src/app/(app)/(detail)/bit/[id].tsx`, `src/app/(app)/(tabs)/material/bit.tsx`

- Save flow keeps `bit.premise_id` in sync with premise `bit_ids_json`
- Re-linking a bit removes it from previous premise and adds it to new premise
- Deleting a bit removes it from linked premise `bit_ids_json`

### Startup reconciliation

File: `src/database/reconcilePremiseBitLinks.ts`, `src/app/_layout.tsx`

- App startup runs a reconciliation pass per launch
- It rebuilds each premise `bit_ids_json` from actual bit rows (`premise_id`)
- This backfills legacy rows created before relation-sync logic existed

## Deletion Behavior

Swipe action triggers permanent deletion:

- `destroyPermanently()` inside `database.write`

This is hard delete. If undo/history is required later, replace with soft-delete
fields and filtered queries.

## UI Components

- List shell: `src/components/feature/material/material-list-screen.tsx`
  - supports controlled search input via `searchValue` and `onSearchChange`
- Card UI: `src/components/feature/material/bit-card.tsx`
  - accepts `bit`, `onPress`, `onDelete?`
  - includes Swipeable right action for delete

## Known Constraints

- Native-only persistence target (iOS/Android)
- `tags` and `setlistIds` are denormalized JSON arrays in bit rows
- Premise linking currently selects from existing premises only
- Full-project lint/typecheck has unrelated existing issues outside bit feature

## Future Improvements

1. Add premise selection/editing flow in bit metadata.
2. Normalize tags into dedicated tables when relational queries are needed.
3. Add optional delete confirmation or undo snackbar.
4. Add tests for create/update/delete/filter and navigation refresh behavior.

## Dev Checklist (when touching bits)

1. Keep `src/domain/bit.ts` as the bit source of truth.
2. Keep DB writes inside `database.write(...)` blocks.
3. Update `updatedAt` on every bit mutation.
4. Verify list refresh after save/back navigation.
5. Verify search/filter behavior and swipe delete.
