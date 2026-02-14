# AGENTS.md - Laughtrack Mobile

Expo Router app with WatermelonDB local-first storage and cloud sync.
Scripts: `bun run mobile` (start), `bun run mobile:ios`, `bun run mobile:android`, `bun run mobile:lint`, `bun run mobile:test`.

## Architecture

- `app/` — Expo Router file-based pages:
  - `(tabs)/` — Tab navigation (jokes list, sets list, learn).
  - `jokes/[id].tsx` — Joke detail/editor.
  - `sets/[id]/index.tsx` — Set detail view.
  - `sets/[id]/edit.tsx` — Set editor (formSheet presentation).
  - `sets/[id]/select-jokes.tsx` — Joke picker modal for sets.
  - `learn/[collectionId]/` — Learning content viewer.
  - `auth/` — Authentication screens.
  - `_layout.tsx` — Root layout with provider tree: GestureHandlerRootView → ErrorBoundary → HeroUINativeProvider → DatabaseProvider → AuthProvider → ThemeProvider → AudioProvider → SetEditingProvider → Stack.
  - `recording-capture-bottom-sheet.tsx`, `recording-list-bottom-sheet.tsx` — Bottom sheet routes.
- `components/` — Reusable UI organized by domain:
  - `audio/` — Audio playback/recording UI.
  - `auth/` — Auth-related components.
  - `bottom-sheets/` — Bottom sheet content.
  - `editor/` — Rich text editor components.
  - `jokes/` — Joke-specific components (JokeCard, TagEditor, etc.).
  - `learn/` — Learning content components.
  - `sets/` — Set-specific components.
  - `theme/` — Theme-related components.
  - `ui/` — Generic UI primitives (MinimalStatusIndicator, etc.).
  - `ErrorBoundary.tsx` — Global error boundary.
- `context/` — React context providers:
  - `AudioContext.tsx` — Audio recording/playback state.
  - `AuthContext.tsx` — Authentication state (better-auth client).
  - `DatabaseContext.tsx` — WatermelonDB instance provider.
  - `SetEditingContext.tsx` — Set create/edit flow state.
  - `ThemeContext.tsx` — Theme (light/dark) state.
- `hooks/` — Custom hooks organized by domain:
  - `jokes/` — Joke query/mutation hooks (useJokesQuery, etc.).
  - `sets/` — Set query/mutation hooks (useJokeSetsQuery, etc.).
  - Root hooks: `useAudioPlayer`, `useAudioRecorder`, `useGoogleSignIn`, `useMultiStepForm`, etc.
- `models/` — WatermelonDB model classes:
  - `Joke.ts` — Joke model with `@field`, `@date`, `@children`, `@writer` decorators.
  - `JokeSet.ts` — Set model with items children relation.
  - `JokeSetItem.ts` — Set item with position, content, jokeId; belongs_to JokeSet.
  - `Tag.ts` — Tag model.
  - `JokeTag.ts` — Join table: belongs_to Joke + Tag.
  - `AudioRecording.ts` — Recording with jokeId, filePath, duration, remoteUrl.
- `db/` — Database wiring:
  - `index.ts` — WatermelonDB database instance setup.
  - `schema.ts` — WatermelonDB table schema definitions.
  - `migrations.ts` — WatermelonDB schema migrations.
- `lib/` — Utilities:
  - `loggers/` — Structured logging (use `uiLogger.debug/error`, not `console`).
  - `types/` — TypeScript type definitions.
  - `auth-client.ts` — better-auth client for Expo.
  - `sync.ts` — WatermelonDB sync adapter (connects to backend `/api/sync`).
  - `audioStorage.ts`, `audioSync.ts`, `audioMode.ts` — Audio file management.
  - `jokeUtils.ts`, `dateUtils.ts`, `htmlParser.ts`, `tagUtils.ts`, `status.ts` — Domain utilities.

## Conventions

- WatermelonDB models use TypeScript decorators (`@field`, `@date`, `@writer`, `@children`, `@relation`). Decorators are enabled in `tsconfig.json` and `babel.config.js`.
- Model table names use snake_case (`joke_set_items`), table name constants exported as `SCREAMING_SNAKE_CASE` (`JOKE_SET_ITEMS_TABLE`).
- Components: page components use default export; reusable components use named export.
- Routing: push with `router.push({ pathname, params })`; read params with `useLocalSearchParams<{ id: string }>()`.
- Styling: Tailwind v4 + Uniwind + HeroUI Native. Use semantic colors (`bg-accent`, `text-foreground`). Prefer HeroUI Native components first.
- Lists: use `@shopify/flash-list` with `estimatedItemSize`. Memoize row components with stable ID/updated_at.
- State: WatermelonDB observables drive list updates. Avoid manual `refetch` when observable-driven updates suffice.
- Tests: Jest + `@testing-library/react-native`. Test files in `__tests__/`. Run with `bun run mobile:test`.
- Import alias: `@/` maps to the mobile app root.
