# Setlist Feature

This document describes the current setlist feature implementation, including
routing, persistence, filtering behavior, and key development constraints.

For end-to-end interaction steps, see `docs/features/setlist/user-flow.md`.

## Scope

Implemented flows:

- Persistent setlist list (WatermelonDB-backed)
- Setlist create/edit screen with ordered items
- Client-side search on setlist description
- Filter by tags
- Swipe-to-delete on setlist cards
- Add-bit modal backed by persisted bits

Out of scope:

- Remote sync
- Soft delete / undo delete
- Normalized setlist item join table (current implementation stores items as JSON)

## Routes

- `/material/setlist` -> Setlist list tab (`src/app/(app)/(tabs)/material/setlist.tsx`)
- `/setlist/new` -> Create setlist (`src/app/(app)/(detail)/setlist/[id].tsx` with `id=new`)
- `/setlist/:id` -> Edit setlist (`src/app/(app)/(detail)/setlist/[id].tsx`)
- `/setlist-filter` -> Filter modal (`src/app/(app)/(modal)/setlist-filter.tsx`)
- `/setlist-add-bit` -> Bit picker form sheet (`src/app/(app)/(modal)/setlist-add-bit.tsx`)

## Data Model

### App type

- Canonical app-facing type: `Setlist` from `src/domain/setlist.ts`
- Re-exported from `src/types.ts`
- Shape:
  - `id: string`
  - `description: string`
  - `items: SetlistItem[]`
  - `tags?: PremiseTag[]`
  - `createdAt: Date`
  - `updatedAt: Date`

`SetlistItem` is a discriminated union:

- `type: 'bit'` -> stores `bitId: string` (persisted), optional `bit?: Bit` (UI hydration only)
- `type: 'set-note'` -> stores `setlistNote` with `id`, `content`, `createdAt`, `updatedAt`

### Database model

- Watermelon model: `src/database/models/setlist.ts` (`SetlistModel` in UI files)
- Table: `setlists` (`src/database/constants.ts`)
- Table metadata: `src/database/setlistSchema.ts`
- Schema registration: `src/database/schema.ts`
- Columns:
  - `description` (string)
  - `items_json` (string)
  - `tags_json` (string)
  - `created_at` (number)
  - `updated_at` (number, indexed)

### Type mapping rule

UI should prefer `Setlist` from `src/types.ts`.
DB operations should use Watermelon `SetlistModel`.

Shared mapping lives in `src/database/mappers/setlistMapper.ts`.

## Persistence Setup

- Database instance: `src/database/index.ts`
- Table migration: `src/database/migrations.ts` (schema version `2`)
- Provider mounted in root layout: `src/app/_layout.tsx`
- Adapter: SQLite (native targets only)

Important project config:

- `babel.config.js` includes decorators plugin (`legacy: true`)
- `tsconfig.json` enables `experimentalDecorators`

## Screen Behavior

### Setlist list screen

File: `src/app/(app)/(tabs)/material/setlist.tsx`

- Observes all setlists sorted by `updated_at desc`
- Performs explicit refresh on focus to avoid stale card content after returning from edit
- Search filter runs client-side on `description`
- Applies route-param filter for `tags`
- FAB action routes to `/setlist/new`
- Supports swipe-to-delete via `SetlistCard` `onDelete`

### Setlist detail screen

File: `src/app/(app)/(detail)/setlist/[id].tsx`

- Uses route param `id`
  - `new`: create mode
  - otherwise: edit mode with `findAndObserve(id)`
- Save behavior:
  - edit mode: update setlist row and sync bit links, then `router.back()`
  - create mode: create setlist row, sync bit links, then `router.back()`
- Persists:
  - `description`
  - `tags` as JSON string array (`tags_json`)
  - ordered `items` in `items_json` (bit items store `bitId` only)
- Supports add bit and add note items; drag-and-drop reorders items
- Shows `Updated ...` timestamp text in edit mode
- Navigates to bit detail when a setlist bit is tapped

### Setlist add-bit form sheet

File: `src/app/(app)/(modal)/setlist-add-bit.tsx`

- Lists persisted bits with search + multi-select
- Supports creating a new bit from inside the sheet
- Returns selected values to setlist detail using route params and a nonce trigger

### Form sheet return contract (nonce apply-once)

Files: `src/app/(app)/(modal)/setlist-add-bit.tsx`, `src/app/(app)/(detail)/setlist/[id].tsx`

- Return params:
  - `addedBits`: comma-separated bit ids
  - `addedBitsNonce`: unique timestamp string used as apply-once trigger
- Setlist detail applies additions only when `addedBitsNonce` exists, then clears both params.
- This prevents duplicate additions when the detail screen re-renders.

### Setlist filter modal

File: `src/app/(app)/(modal)/setlist-filter.tsx`

- Tag options are derived dynamically from persisted setlists (`tags_json`)
- Applies selected filters through route params

### Startup reconciliation

File: `src/database/reconcileSetlistBitLinks.ts`, `src/app/_layout.tsx`

- App startup runs a reconciliation pass per launch
- It rebuilds each bit `setlist_ids_json` from setlist `items_json`
- This backfills legacy rows created before relation-sync logic existed

## Deletion Behavior

Swipe action triggers permanent deletion:

- `destroyPermanently()` inside `database.write`

This is hard delete. If undo/history is required later, replace with soft-delete
fields and filtered queries.

## UI Components

- List shell: `src/components/feature/material/material-list-screen.tsx`
  - supports controlled search input via `searchValue` and `onSearchChange`
- Card UI: `src/components/feature/material/setlist-card.tsx`
  - accepts `setlist`, `onPress`, `onDelete?`
  - includes Swipeable right action for delete

## Known Constraints

- Native-only persistence target (iOS/Android)
- `items` and `tags` are denormalized JSON arrays in setlist rows
- Setlist bit items persist `bitId` only; `bit` is UI hydration only
- Full-project lint/typecheck has unrelated existing issues outside setlist feature

## Future Improvements

1. Normalize setlist items into a dedicated join table if relational queries are needed.
2. Add optional delete confirmation or undo snackbar.
3. Add tests for create/update/delete/filter and navigation refresh behavior.
4. Add sync support if backend replication is needed.

## Dev Checklist (when touching setlists)

1. Keep `src/domain/setlist.ts` as the setlist source of truth.
2. Keep DB writes inside `database.write(...)` blocks.
3. Update `updatedAt` on every setlist mutation.
4. Verify list refresh after save/back navigation.
5. Verify add-bit return contract is nonce-gated and deduped.
6. Verify search/filter behavior and swipe delete.
