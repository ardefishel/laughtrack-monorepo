# AGENTS.md - Laughtrack Backend

Hono API server running on Bun.

Scripts:
- In `apps/backend`: `bun run dev`, `bun run build`, `bun run check`, `bun run lint`, `bun run format`
- From repo root: `bun run backend`, `bun run backend:build`, `bun run backend:check`, `bun run backend:format`
- DB from root: `bun run db:generate`, `bun run db:migrate`, `bun run db:push`, `bun run db:studio`
- Docker from root: `bun run docker:up`, `bun run docker:down`, `bun run docker:logs`

## Architecture

- `src/index.ts` - Hono app with global security headers, request logger, error middleware, and route mounting.
- `src/server.ts` - Bun.serve startup with explicit connect/disconnect flow.
- `src/routes/` - Route modules:
  - `auth-routes.ts` mounted at `/api/auth/*` (session, verify, better-auth catch-all).
  - `mobile/` mounted at `/api/mobile/*`.
    - `mobile/index.ts` - mobile CORS host (`laughtrack://`) and sub-route mounting.
    - `mobile/sync-routes.ts` - WatermelonDB pull/push sync with conflict detection.
  - `admin/` mounted at `/api/web/*`.
    - `admin/index.ts` - web CORS hosts.
    - `admin/admin-routes.ts` - dashboard stats and admin CRUD/reporting endpoints.
  - `runtime-routes.ts` mounted at `/api/detect/*` in development.
- `src/middlewares/auth.ts` - `authMiddleware`, `requireAuth`, `requireAdmin`.
- `src/middlewares/error.ts` - global error handler.
- `src/middlewares/logger.ts` - request logger.
- `src/auth/index.ts` - better-auth setup with Drizzle adapter, Expo plugin, admin plugin, and Google OAuth.
- `src/db/schema.ts` - Drizzle PostgreSQL schema.
- `src/db/index.ts` - database connection lifecycle.
- `src/lib/response.ts` - shared response helpers.

## Conventions

- Keep routes consumer-scoped (`/api/auth`, `/api/mobile`, `/api/web`) and mount through `src/index.ts`.
- Apply CORS per sub-app (`mobile` vs `web`), not globally.
- Use `requireAuth` for authenticated mobile/admin routes and `requireAdmin` for admin-only operations.
- Use Drizzle with `db` from `src/db` and keep soft-delete fields (`isDeleted`, `lastModified`) updated.
- Sync field mapping between camelCase and snake_case remains in `src/routes/mobile/sync-routes.ts`.
- Env vars used in backend include `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `PUBLIC_WEB_URL`, `EMAIL_TRANSPORT`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_NAME`, `SMTP_FROM_EMAIL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `PORT`, `NODE_ENV`, `CORS_ORIGIN`.
- Backend tests run via `bun test` / `bun run check`; current coverage includes contract tests plus auth email config/mailer/resend helper tests.
