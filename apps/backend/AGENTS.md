# AGENTS.md - Laughtrack Backend

Hono API server running on Bun. Entry: `src/server.ts` → `src/index.ts`.
Scripts: `bun run dev`, `bun run build`, `bun run check`, `bun run format`.
DB scripts (from root): `bun run db:generate`, `bun run db:migrate`, `bun run db:push`, `bun run db:studio`.
Docker: `bun run docker:up` (PostgreSQL), `bun run docker:down`, `bun run docker:logs`.

## Architecture

- `src/index.ts` — Hono app with global middleware (CORS, security headers, logger, error handler) and route mounting.
- `src/server.ts` — Bun.serve startup with graceful shutdown.
- `src/routes/` — Route modules mounted at `/api/*`:
  - `auth-routes.ts` → `/api/auth/*` — Session check, verify, and better-auth catch-all handler.
  - `sync-routes.ts` → `/api/sync/*` — WatermelonDB pull/push sync with conflict detection.
  - `audio-routes.ts` → `/api/audio/*` — Cloudflare R2 presigned URL generation for upload/download.
  - `runtime-routes.ts` → `/api/detect/*` — Dev-only runtime environment detection.
- `src/middlewares/` — Hono middleware:
  - `auth.ts` — `authMiddleware` (populates user/session, allows unauthenticated) and `requireAuth` (returns 401).
  - `error.ts` — Global error handler.
  - `logger.ts` — Request logger.
- `src/auth/index.ts` — better-auth config with Drizzle adapter, Google OAuth, Expo plugin, email/password.
- `src/db/schema.ts` — Drizzle ORM schema (PostgreSQL) with all tables and relations.
- `src/db/index.ts` — Database connection/disconnection.
- `src/lib/r2.ts` — Cloudflare R2 S3-compatible client setup.
- `src/lib/response.ts` — Response helpers.

## Conventions

- Routes: create a `new Hono()`, export it, mount in `src/index.ts` via `app.route('/api/prefix', routeModule)`.
- Auth: use `requireAuth` middleware for protected routes; access user via `c.get('user')`.
- DB queries: use Drizzle query builder with `db` import from `../db`. All domain tables have `userId`, `lastModified`, `isDeleted` (soft delete).
- Env vars: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `PORT`, `NODE_ENV`, `CORS_ORIGIN`.
- Sync: camelCase↔snake_case field mapping handled by `CAMEL_TO_SNAKE`/`SNAKE_TO_CAMEL` maps in sync-routes.
- No tests exist yet. When adding tests, use Bun's built-in test runner.
- TypeScript strict mode. Formatting: 120 columns, single quotes, no trailing commas.
