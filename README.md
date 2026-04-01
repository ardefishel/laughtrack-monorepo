# Laughtrack

A comedian's toolkit for writing, organizing, and performing jokes. Mobile-first app with cloud sync.

## Monorepo Structure

```
apps/
  mobile/       — Expo Router + WatermelonDB (local-first React Native app)
  backend/      — Hono + Drizzle + PostgreSQL API (Bun runtime)
  web/          — Admin dashboard
  marketing/    — Marketing site
packages/
  shared-types/ — Shared TypeScript type definitions (@laughtrack/shared-types)
  logger/       — Cross-platform structured logger (@laughtrack/logger)
  html-utils/   — HTML parsing and text extraction (@laughtrack/html-utils)
  tsconfig/     — Shared TypeScript configurations (@laughtrack/tsconfig)
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (v1.1+)
- [Docker](https://www.docker.com/) (for PostgreSQL)
- Xcode (for iOS simulator) or Android Studio (for Android emulator)

### Setup

```bash
# Install dependencies
bun install

# Start PostgreSQL
bun run docker:up

# Copy env files and fill in values
cp apps/backend/.env.example apps/backend/.env
cp apps/mobile/.env.example apps/mobile/.env

# Run database migrations
bun run db:migrate

# Start both apps
bun run dev
```

### Google Sign-In (Google Cloud Only)

This mobile app uses `@react-native-google-signin/google-signin` with **Google Cloud OAuth clients** (not Firebase config files).

1. In Google Cloud Console, create OAuth client IDs for:
   - **Web** client (used for `idToken` exchange)
   - **iOS** client for bundle ID `com.rtvcl.laughtrack`
   - **Android** client for package `com.rtvcl.laughtrack` (with SHA-1 configured)
2. Set mobile env vars in `apps/mobile/.env`:
   - `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
   - `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
3. Rebuild native apps after config changes:
   - `bun run mobile:ios`
   - `bun run mobile:android`

Notes:
- `google-services.json` and `GoogleService-Info.plist` are only needed when using Firebase-based setup.

### Backend Env Vars

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | better-auth secret key |
| `AUTH_URL` | Auth base URL (e.g., `http://localhost:3000`) |
| `PUBLIC_WEB_URL` | Public verify-email page host (should point to the public web/marketing app, not `AUTH_URL`) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `EMAIL_TRANSPORT` | Email delivery mode: `smtp` for real delivery, `stub` for tests/local stub mode |
| `SMTP_HOST` | SMTP host (Google SMTP default: `smtp.gmail.com`) |
| `SMTP_PORT` | SMTP port (Google SMTP default: `587`) |
| `SMTP_SECURE` | SMTP TLS mode (`false` for STARTTLS on 587, `true` for implicit TLS on 465) |
| `SMTP_USER` | SMTP username / mailbox address |
| `SMTP_PASS` | SMTP password or app password |
| `SMTP_FROM_NAME` | Sender name for transactional email |
| `SMTP_FROM_EMAIL` | Sender email address for transactional email |
| `PORT` | Server port (default: 3000) |
| `NODE_ENV` | `development` or `production` |

Notes:
- Keep `PUBLIC_WEB_URL` pointed at the public verification page host, not the backend auth host.
- `EMAIL_TRANSPORT` should stay `stub` for local/test environments until real SMTP credentials are configured.
- For Google SMTP, prefer an app password and `SMTP_SECURE=false` on port `587` unless your provider requires implicit TLS.
- Email verification in v1 applies to email/password auth only; Google OAuth stays unchanged.
- Verification links land on the public `/verify-email` page first, then offer an app handoff.

### Mobile Env Vars

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_API_URL` | Backend API URL (e.g., `http://localhost:3000`) |
| `EXPO_PUBLIC_MARKETING_URL` | Public marketing site URL used for legal/support links |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Google OAuth web client ID |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | Google OAuth iOS client ID |
| `EXPO_PUBLIC_VERBOSE_LOGS` | Enable verbose logging (`true`/`false`) |

### Marketing/Web Env Vars

| Variable | Description |
|----------|-------------|
| `VITE_OPEN_APP_URL` | Deep link used by the public verify-email page `Open app` CTA |
| `VITE_PUBLIC_WEB_URL` | Public marketing/web host used when web login points users toward verification help |

Verification flow notes:
- Backend and tests use the same verification-link shape: `PUBLIC_WEB_URL/verify-email?token=...`.
- Backend tests use `EMAIL_TRANSPORT=stub`; they never attempt a live Gmail SMTP connection.

## Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start both apps |
| `bun run check` | Lint all workspaces |
| `bun run mobile` | Start Expo dev server |
| `bun run mobile:ios` | Run on iOS simulator |
| `bun run mobile:android` | Run on Android emulator |
| `bun run mobile:test` | Run mobile tests |
| `bun run backend` | Start backend dev server |
| `bun run db:generate` | Generate Drizzle migration |
| `bun run db:migrate` | Run migrations |
| `bun run db:push` | Push schema to DB |
| `bun run db:studio` | Open Drizzle Studio |
| `bun run docker:up` | Start PostgreSQL container |
| `bun run docker:down` | Stop PostgreSQL container |

## Documentation

- [API Routes](apps/backend/ROUTES.md) — Backend endpoint reference
- [Mobile Project Overview](apps/mobile/docs/project-overview.md) — Architecture, setup, and structure
- [Data Modeling](apps/mobile/docs/architecture/data-modeling.md) — Entity relationships and schema
- [Design System](.agents/design-system-baseline.md) — UI tokens and component patterns
