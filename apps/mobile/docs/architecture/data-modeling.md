# Data Modeling

This document defines how data models should be structured across the app so we
keep a single app-level source of truth while still supporting WatermelonDB
storage constraints.

## Goal

Use one canonical shape for app code, and explicit mapping for persistence.

- Canonical domain contract: Zod schemas in `src/domain/*`
- Persistence contract: Watermelon schema/model files in `src/database/*`
- Bridge layer: mapper utilities in `src/database/mappers/*`

## Current Implemented Examples

The same structure is now implemented for Note, Premise, and Bit entities.

### Note

### 1) Domain (app-facing source of truth)

- File: `src/domain/note.ts`
- Owns `NoteSchema` and `Note` type
- Uses app-friendly field names and types (`createdAt: Date`)

### 2) Database schema metadata

- File: `src/database/noteSchema.ts`
- Owns table/column constants (`NOTE_COLUMNS`) and table schema
- Owns DB record shape (`NoteRecord`) with DB-native fields (`created_at: number`)

### 3) Watermelon model behavior

- File: `src/database/models/note.ts`
- Owns runtime model behavior (`updateContent` writer)
- Uses shared column constants instead of repeating string literals

### 4) Storage schema registration

- File: `src/database/schema.ts`
- Registers table schemas (currently `NOTE_TABLE_SCHEMA`)

### 5) Mapping between layers

- File: `src/database/mappers/noteMapper.ts`
- Converts DB records/models <-> domain type
- Handles snake_case <-> camelCase and number timestamp <-> `Date`

### Premise

### 1) Domain (app-facing source of truth)

- File: `src/domain/premise.ts`
- Owns `PremiseSchema` and related premise enums/types
- Uses app-friendly field names and types (`updatedAt: Date`)

### 2) Database schema metadata

- File: `src/database/premiseSchema.ts`
- Owns table/column constants (`PREMISE_COLUMNS`) and table schema
- Owns DB record shape (`PremiseRecord`) with DB-native fields (`tags_json`, `updated_at`)

### 3) Watermelon model behavior

- File: `src/database/models/premise.ts`
- Owns runtime model behavior (`updatePremise` writer)
- Uses shared column constants instead of repeating string literals

### 4) Storage schema registration

- File: `src/database/schema.ts`
- Registers premise table schema (`PREMISE_TABLE_SCHEMA`)
- File: `src/database/migrations.ts`
- Handles schema upgrades (premises added at version `2`)

### 5) Mapping between layers

- File: `src/database/mappers/premiseMapper.ts`
- Converts DB records/models <-> domain type
- Handles snake_case <-> camelCase and JSON array serialization for tags/bit IDs

### Bit

### 1) Domain (app-facing source of truth)

- File: `src/domain/bit.ts`
- Owns `BitSchema`, `BitStatusSchema`, and related bit types
- Uses app-friendly field names and types (`updatedAt: Date`)

### 2) Database schema metadata

- File: `src/database/bitSchema.ts`
- Owns table/column constants (`BIT_COLUMNS`) and table schema
- Owns DB record shape (`BitRecord`) with DB-native fields (`tags_json`, `premise_id`, `setlist_ids_json`)

### 3) Watermelon model behavior

- File: `src/database/models/bit.ts`
- Owns runtime model behavior (`updateBit` writer)
- Uses shared column constants instead of repeating string literals

### 4) Storage schema registration

- File: `src/database/schema.ts`
- Registers bit table schema (`BIT_TABLE_SCHEMA`)
- File: `src/database/migrations.ts`
- Handles schema upgrades (bits added at version `3`)

### 5) Mapping between layers

- File: `src/database/mappers/bitMapper.ts`
- Converts DB records/models <-> domain type
- Handles snake_case <-> camelCase and JSON array serialization for tags/setlist IDs

## Rules of Thumb

1. UI/features should use domain types (`src/domain/*` or re-exports from `src/types.ts`).
2. Do not leak DB field names (`created_at`) into app/UI logic.
3. Keep all shape conversions inside mapper files.
4. Keep DB writes inside `database.write(...)` blocks.
5. Reuse column constants for Watermelon schema and decorators.

## When Adding a New Entity

For each new entity (for example Premise, Bit, Setlist):

1. Add domain schema/type in `src/domain/<entity>.ts`.
2. Add DB table constants + `*Record` in `src/database/<entity>Schema.ts`.
3. Add Watermelon model in `src/database/models/<entity>.ts`.
4. Add mapper in `src/database/mappers/<entity>Mapper.ts`.
5. Register table schema in `src/database/schema.ts` and model in `src/database/index.ts`.

This keeps the domain contract stable while making persistence implementation
explicit and replaceable.
