# Note Feature

This document describes the current note feature implementation, including
routing, persistence, UI behavior, and important development constraints.

For end-to-end interaction steps, see `docs/features/note/user-flow.md`.

## Scope

Implemented flows:

- Persistent note list (WatermelonDB-backed)
- Quick create from Home tab
- Full note list screen with search
- Note create/edit screen
- Swipe-to-delete on note cards

Out of scope:

- Remote sync
- Soft delete / undo delete
- Rich text notes

## Routes

- `/note` -> Note list screen (`src/app/(app)/(detail)/note/index.tsx`)
- `/note/new` -> Create note (`src/app/(app)/(detail)/note/[id].tsx` with `id=new`)
- `/note/:id` -> Edit note (`src/app/(app)/(detail)/note/[id].tsx`)

From Home (`src/app/(app)/(tabs)/home/index.tsx`):

- "See all" goes to `/note`
- Quick note bar creates immediately in DB

## Data Model

### App type

- Canonical app-facing type: `Note` from `src/types.ts`
- Shape:
  - `id: string`
  - `content: string`
  - `createdAt: Date`
  - `updatedAt: Date`

### Database model

- Watermelon model: `src/database/models/note.ts` (`NoteModel` in UI files)
- Table: `notes` (`src/database/constants.ts`)
- Schema: `src/database/schema.ts`
  - `content` (string)
  - `created_at` (number)
  - `updated_at` (number, indexed)

### Type mapping rule

UI should prefer `Note` from `src/types.ts`.
DB operations should use Watermelon `NoteModel`.

Shared mapping lives in `src/database/mappers/noteMapper.ts`.

## Persistence Setup

- Database instance: `src/database/index.ts`
- Provider mounted in root layout: `src/app/_layout.tsx`
- Adapter: SQLite (native targets only)

Important project config:

- `babel.config.js` includes decorators plugin (`legacy: true`)
- `tsconfig.json` enables `experimentalDecorators`

## Screen Behavior

### Home screen

File: `src/app/(app)/(tabs)/home/index.tsx`

- Observes latest 6 notes sorted by `updated_at desc`
- Quick note input writes a new note via `database.write`
- Supports swipe-to-delete via `RecentNoteCard` `onDelete`
- Refreshes on focus to avoid stale card content after navigation back

### Note list screen

File: `src/app/(app)/(detail)/note/index.tsx`

- Observes all notes sorted by `updated_at desc`
- Header action `New` -> `/note/new`
- Client-side search filter on `content`
- Supports swipe-to-delete
- Refreshes on focus for consistent post-edit state

### Note detail screen

File: `src/app/(app)/(detail)/note/[id].tsx`

- Uses route param `id`
  - `new`: create mode
  - otherwise: edit mode with `findAndObserve(id)`
- Save behavior:
  - edit mode: update note, then `router.back()`
  - create mode: create note, then `router.back()` (returns to list)
- Timestamp label shown as `Updated ...`
  - handles `Just now` from `timeAgo` as `Updated just now`
  - includes horizontal padding to align with card content

## Observation and Re-render Notes

`findAndObserve(id)` may emit the same model reference after updates. To ensure
re-render safety, detail screen stores wrapper state:

- `{ note: NoteModel, key: number }`

This forces a new object identity on each emission and avoids missed updates.

## Deletion Behavior

Swipe action triggers permanent deletion:

- `destroyPermanently()` inside `database.write`

This is hard delete. If you need undo/history later, replace with soft-delete
fields and filtered queries.

## UI Components

- Card UI: `src/components/feature/home/recent-note-card.tsx`
  - accepts `note`, `onPress`, `onDelete?`
  - includes Swipeable right action for delete
- Quick input: `src/components/feature/home/quick-note-bar.tsx`
  - controlled input, submit callback, disabled while submitting

## Known Constraints

- Native-only persistence target (iOS/Android)
- No migration file yet (schema version is `1`)
- Full-project lint/typecheck has unrelated existing issues outside note feature

## Future Improvements

1. Add unit/integration tests for create/update/delete/navigation behavior.
2. Add optional delete confirmation or undo snackbar.
3. Add DB migrations plan before schema changes.
4. Add sync layer if backend replication is needed.

## Dev Checklist (when touching notes)

1. Keep `src/types.ts` as the app-level contract.
2. Keep DB writes inside `database.write` blocks.
3. Update `updatedAt` on every content mutation.
4. Verify list/home refresh after edit and create.
5. Verify swipe delete from both Home and Note list.
