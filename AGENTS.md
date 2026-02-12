# AGENTS.md - Laughtrack

Monorepo: Bun workspaces (`apps/mobile`, `apps/backend`). Run from root.
Scripts (root): `bun run dev` (both apps), `bun run check` (lint all), `bun run lint` (lint all), `bun run clean` (nuke all).
Mobile: `bun run mobile`, `bun run mobile:ios`, `bun run mobile:android`, `bun run mobile:lint`, `bun run mobile:test`.
Backend: `bun run backend`, `bun run backend:build`, `bun run backend:check`, `bun run backend:format`.
DB: `bun run db:generate`, `bun run db:migrate`, `bun run db:push`, `bun run db:studio`.
Docker: `bun run docker:up`, `bun run docker:down`, `bun run docker:logs`.
Single test: Jest + `@testing-library/react-native` configured in mobile.
Architecture: Expo Router pages in `app/` (tabs, jokes, sets, learn); reusable UI in `components/`; state in `context/` + `contexts/`.
Data: WatermelonDB models in `models/`, database wiring in `db/`; utilities/types/logging in `lib/`.
Styling: Tailwind v4 + Uniwind with HeroUI Native semantic colors (e.g. `bg-background`, `text-foreground`). Prefer `-accent` semantic colors (e.g. `bg-accent`, `text-accent-foreground`) over `-primary` for theming consistency. Prefer HeroUI Native components for UI before reaching for custom or React Native primitives.
Routing: file-based; push with `router.push({ pathname, params })` and read via `useLocalSearchParams()`.
Language: TypeScript (strict); decorators enabled for WatermelonDB models.
Formatting: 120 columns, single quotes, no trailing commas, bracket spacing on.
Imports order: React, React Native, Expo Router, third-party, local (`@/` alias), types.
Naming: components/files PascalCase, hooks `useXxx`, constants `SCREAMING_SNAKE_CASE`, types PascalCase.
Components: page components default export; reusable components named export; memoize list rows with stable ID/updated_at.
Logging: prefer `@/lib/loggers` (`uiLogger.debug/error`) over `console`.
Error handling: wrap async storage/db calls in `try/catch` and log errors.
Lists: use `@shopify/flash-list` for large lists.
Accessibility: add `accessibilityRole/Label/State` on interactive elements.
Rules files: no `.cursor/rules`, `.cursorrules`, `CLAUDE.md`, `.windsurfrules`, `.clinerules`, `.goosehints`, or Copilot instructions found.
