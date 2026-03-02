# AGENTS.md - Laughtrack

Monorepo: Bun workspaces. Primary apps are `apps/mobile` and `apps/backend`, with additional `apps/web` and `apps/marketing` workspaces. Run commands from root.

Shared packages live in `packages/` (`@laughtrack/shared-types`, `@laughtrack/logger`, `@laughtrack/html-utils`, `@laughtrack/tsconfig`).

Root scripts:
- Core: `bun run dev` (all workspaces), `bun run check`, `bun run lint`, `bun run clean`
- Mobile: `bun run mobile`, `bun run mobile:ios`, `bun run mobile:ios:device`, `bun run mobile:android`, `bun run mobile:lint`, `bun run mobile:test`
- Backend: `bun run backend`, `bun run backend:build`, `bun run backend:check`, `bun run backend:format`
- Web/Marketing: `bun run web`, `bun run web:build`, `bun run web:check`, `bun run marketing`, `bun run marketing:build`
- DB: `bun run db:generate`, `bun run db:migrate`, `bun run db:push`, `bun run db:studio`
- Docker: `bun run docker:up`, `bun run docker:down`, `bun run docker:logs`

Testing status:
- Mobile currently has no configured test runner or `test` script in `apps/mobile/package.json`.
- Treat `bun run mobile:test` as unavailable until a mobile test command is added.

Architecture: Expo Router pages in `apps/mobile/src/app/`; reusable UI in `apps/mobile/src/components/`; state in `apps/mobile/src/context/`.
Data: WatermelonDB models in `apps/mobile/src/database/models/`, database wiring in `apps/mobile/src/database/`; app utilities/types/logging in `apps/mobile/src/lib/`.
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
