# LaughTrack Mobile v2 - Agent Guide

## Scope
- This repo is an Expo + React Native app using Expo Router, WatermelonDB, HeroUI Native, Uniwind.
- Use this file as the first stop for commands and code conventions.

## Tooling and package manager
- `bun.lock` exists; prefer Bun for local commands and scripts.
- Node.js 20+ required (docs).

## Common commands (from `package.json` and docs)
- Install deps: `bun install`
- Start dev server: `bun run start` (alias for `expo start`)
- Web dev server: `bun run web` (alias for `expo start --web`)
- iOS build: `bun run ios` (alias for `expo run:ios`)
- Android build: `bun run android` (alias for `expo run:android`)
- Lint: `bun run lint` (alias for `expo lint`)

## Tests
- No test runner is configured in `package.json`.
- No test files (`*.test.*` / `*.spec.*`) found.
- Single-test command: not available until a test framework is added.

## Key configs
- ESLint: `eslint.config.js` (Expo flat config).
- TypeScript: `tsconfig.json` (extends `expo/tsconfig.base`, `strict: true`, `experimentalDecorators: true`).
- Babel: `babel.config.js` (decorators + `expo-router/babel` + `react-native-reanimated/plugin`).
- Metro: `metro.config.js` (Uniwind config, css entry: `src/globals.css`).

## Project structure (see `docs/project-overview.md`)
- `src/app/`: Expo Router routes and layout groups.
- `src/components/`: feature and shared UI components.
- `src/database/`: WatermelonDB schema, constants, models, mappers.
- `src/domain/`: Zod schemas for domain contracts.
- `src/types.ts`: app-level exports and inferred types.
- `docs/`: feature docs and architecture notes.

## Import conventions (observed)
- Use `@/` alias for `src` (configured in `tsconfig.json`).
- Prefer type-only imports for types (`import type { ... }`).
- Typical order in files: internal `@/` imports mixed with external; keep existing file order.
- Follow the file’s current quote style (`'` vs `"`); do not reformat.

## Formatting conventions (observed)
- Mixed 2-space and 4-space indentation across files; follow existing file indentation.
- Semicolons are inconsistently used; preserve existing style in each file.
- JSX uses `className="..."` with Uniwind/Tailwind classes.
- Keep line wraps readable; avoid reformatting unrelated code.

## Type conventions
- Domain schemas use Zod (`src/domain/*`) and infer types with `z.infer`.
- App-level exports live in `src/types.ts` (use these in UI-facing code).
- Use explicit types for props and state; prefer `type`/`interface` near component definitions.
- `strict` TypeScript is enabled; avoid `any` and unsafe casts.

## Naming conventions (observed)
- Files: kebab-case (`bit-filter.tsx`, `time-ago.ts`).
- Components: PascalCase (`BitCard`, `QuickNoteBar`).
- Hooks: `use*` camelCase.
- Database constants: `SCREAMING_SNAKE_CASE` for tables/columns.
- JSON-backed columns: `tagsJson`, `setlistIdsJson` in models.

## React and Expo patterns
- Expo Router file-based routing under `src/app/`.
- Root providers live in `src/app/_layout.tsx` (GestureHandler, WatermelonDB, HeroUI, Keyboard).
- Modal routes are registered in `src/app/(app)/_layout.tsx` with form-sheet presentations.
- For modal -> detail handoff, use primitive route params plus nonce trigger (see `docs/project-overview.md`).
- For form-sheet returns, prefer `router.dismissTo(...)` to avoid duplicate screens.

## WatermelonDB patterns
- Models use decorators (`@field`, `@date`, `@writer`) and extend `Model`.
- All mutations must be wrapped in `database.write(...)`.
- Update `updatedAt` on every mutation (see feature docs checklists).
- Domain <-> DB mapping lives in `src/database/mappers/*`.

## Error handling
- Prefer safe defaults when parsing (see `parseStringArrayJson` in `src/database/mappers/bitMapper.ts`).
- Use `try/finally` for loading state cleanup.
- If an operation is critical, log errors with context and rethrow or surface a fallback.
- Avoid empty catch blocks without a clear recovery path.

## UI and styling
- Uniwind/Tailwind-style classes in `className` (e.g., `text-foreground`, `bg-background`).
- HeroUI Native components in `src/components` and screens.
- Reuse shared components before adding new primitives.

## Data contracts and validation
- Use Zod schemas from `src/domain/*` and exports from `src/types.ts`.
- When mapping from DB records, validate with schema parse (see `bitMapper.ts`).

## Navigation and routes
- Route names map to file paths; keep route params consistent with file names.
- Detail routes use `[id].tsx` and expect `id` values like `new` for create flow.
- Filter/modals use explicit param sets rather than serialized JSON blobs.

## Performance and state patterns (observed)
- Use `useCallback`/`useMemo` around handlers for list-heavy screens.
- `useEffect` subscriptions should return cleanup (WatermelonDB observe).
- For async fire-and-forget, code uses `void` to discard promises.
- Use `memo(...)` for card components that render lists (see `BitCard`).

## Docs to consult before changes
- `docs/project-overview.md` for architecture + routing rules.
- `docs/architecture/data-modeling.md` for domain/DB flow.
- `docs/features/note/README.md` for note behavior + constraints.
- `docs/features/premise/README.md` for premise behavior + constraints.
- `docs/features/bit/README.md` for bit behavior + constraints.

## Linting
- `bun run lint` runs Expo ESLint rules; fix lint errors before committing.
- No Prettier config present; do not auto-format unless asked.

## Build and run notes
- Dev server: `expo start` via `bun run start`.
- Native builds: `expo run:ios` / `expo run:android` via bun scripts.
- Web: `expo start --web` via `bun run web`.

## Local DB and migrations
- Schema is in `src/database/schema.ts`.
- Migrations live in `src/database/migrations.ts`.
- Decorators require TS + Babel settings (see `tsconfig.json`, `babel.config.js`).

## Cursor/Copilot rules
- No `.cursor/rules/`, `.cursorrules`, or `.github/copilot-instructions.md` found.

## Agent operating rules for this repo
- Follow existing file style; avoid broad reformatting.
- Preserve file-based routing conventions and modal patterns.
- Keep app-facing types in `src/types.ts` and DB logic in `src/database/*`.
- Prefer WatermelonDB observers for live updates and clean up subscriptions.
- Keep UI list items memoized when rendering collections.
- Update docs in `docs/features/<feature>/README.md` when behavior changes.

## Quick reference: single-file examples
- Root layout providers: `src/app/_layout.tsx`
- Tabs layout: `src/app/(app)/(tabs)/_layout.tsx`
- Modal layout: `src/app/(app)/_layout.tsx`
- Domain types: `src/domain/*.ts`
- DB models: `src/database/models/*.ts`
- Mappers: `src/database/mappers/*.ts`
- UI cards: `src/components/feature/*/*-card.tsx`

## Known gaps
- No test runner configured yet.
- Some lint/typecheck issues may exist outside touched feature docs.

## Change checklist
- Run `bun run lint` before finishing.
- Verify app starts with `bun run start` when making runtime changes.
- If you add tests later, document commands here.
