# Laughtrack API Routes

Base URL: `http://localhost:3000` (configurable via `PORT` env var).

## Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Returns `{ status: "ok", timestamp }` |

## Auth — `/api/auth/*` (Shared)

Used by both mobile and web clients.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/auth/session` | `authMiddleware` | Returns current user and session, or 401 |
| GET | `/api/auth/verify` | `authMiddleware` | Returns `{ valid: true, user }` or `{ valid: false }` with 401 |
| ALL | `/api/auth/*` | No | Catch-all for better-auth endpoints (sign-up, sign-in, OAuth callbacks, etc.) |

### better-auth Built-in Endpoints (handled by catch-all)
- `POST /api/auth/sign-up/email` — Email/password registration
- `POST /api/auth/sign-in/email` — Email/password sign-in
- `GET /api/auth/sign-in/social?provider=google` — Google OAuth initiation
- `GET /api/auth/callback/google` — Google OAuth callback
- `POST /api/auth/sign-out` — Sign out
- See [better-auth docs](https://www.better-auth.com/docs) for full list

---

## Mobile — `/api/mobile/*`

Endpoints consumed exclusively by the mobile (Expo) app. CORS restricted to `laughtrack://`.

### Sync — `/api/mobile/sync/*`

WatermelonDB-compatible sync protocol. All endpoints require `requireAuth`.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/mobile/sync/pull?last_pulled_at=<timestamp>` | `requireAuth` | Pull changes since timestamp. Returns `{ changes: { jokes, joke_sets, joke_set_items, audio_recordings, tags, joke_tags }, timestamp }`. Each table has `{ created, updated, deleted }`. First pull (no timestamp) returns all records. Audio recordings have `file_path` stripped. |
| POST | `/api/mobile/sync/push` | `requireAuth` | Push local changes. Body: `{ changes: { [tableName]: { created?, updated?, deleted? } }, lastPulledAt }`. Runs in a transaction. Uses upsert (INSERT ON CONFLICT UPDATE). Conflict detection: if server `lastModified > lastPulledAt`, returns 409. Soft deletes set `isDeleted: true`. |

#### Sync Tables
`jokes`, `joke_sets`, `joke_set_items`, `audio_recordings`, `tags`, `joke_tags`

#### Field Mapping
Client uses snake_case, Drizzle uses camelCase. Mapped fields:
`contentHtml↔content_html`, `contentText↔content_text`, `draftUpdatedAt↔draft_updated_at`, `createdAt↔created_at`, `updatedAt↔updated_at`, `setId↔set_id`, `itemType↔item_type`, `jokeId↔joke_id`, `tagId↔tag_id`, `filePath↔file_path`, `remoteUrl↔remote_url`.

Internal fields stripped from sync: `userId`, `serverCreatedAt`, `lastModified`, `isDeleted` (server-side); `_status`, `_changed` (client-side).

### Audio — `/api/mobile/audio/*`

Cloudflare R2 presigned URL management. All endpoints require `requireAuth`.

| Method | Path | Auth | Body | Description |
|--------|------|------|------|-------------|
| POST | `/api/mobile/audio/upload-url` | `requireAuth` | `{ recordingId }` | Generates a presigned PUT URL for uploading audio to R2. Verifies recording exists and belongs to user. Returns `{ url, key, expiresIn: 600 }`. Content-Type: `audio/mp4`. |
| POST | `/api/mobile/audio/confirm-upload` | `requireAuth` | `{ recordingId, key }` | Confirms upload completed. Updates `remoteUrl` on the recording. Validates key matches expected format. Returns `{ ok: true }`. |
| POST | `/api/mobile/audio/download-url` | `requireAuth` | `{ recordingId }` | Generates a presigned GET URL for downloading audio from R2. Reconstructs key from userId+recordingId (prevents IDOR). Returns `{ url, expiresIn: 600 }`. |

---

## Web — `/api/web/*`

Dashboard and content endpoints consumed by the web app. CORS restricted to `CORS_ORIGIN` and `http://localhost:3001`.

Content routes require `requireAuth` (any authenticated user). User management routes require `requireAdmin` (role-based).

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/web/stats` | `requireAuth` | Dashboard summary. Returns counts for users, jokes, sets, audioRecordings, tags. |
| GET | `/api/web/users` | `requireAdmin` | List all users (paginated). Query: `?page=1&limit=20`. Returns id, email, name, image, role, banned, emailVerified, createdAt. |
| GET | `/api/web/users/:id` | `requireAdmin` | User detail with content counts (jokes, sets, audioRecordings, tags). |
| PUT | `/api/web/users/:id` | `requireAdmin` | Update user details (name, email, role, banned, banReason). |
| GET | `/api/web/jokes` | `requireAuth` | List all jokes (paginated). Query: `?page=1&limit=20&userId=optional`. Returns jokes with user name/email joined, contentText truncated to 100 chars. |
| GET | `/api/web/jokes/:id` | `requireAuth` | Single joke detail with full content and user info. |
| GET | `/api/web/sets` | `requireAuth` | List all joke sets (paginated). Query: `?page=1&limit=20&userId=optional`. Returns sets with user name/email joined and itemCount. |
| GET | `/api/web/sets/:id` | `requireAuth` | Single set detail with all items and user info. |

Soft-deleted records (`isDeleted: true`) are excluded from all queries.

---

## Runtime Detection — `/api/detect/*` (dev only)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/detect/runtime` | No | Returns runtime environment info (Bun version, Node version, Vercel detection). Only mounted when `NODE_ENV=development`. |

## CORS Configuration

CORS is configured per-consumer:
- **Auth routes** (`/api/auth/*`): Accepts `CORS_ORIGIN`, `http://localhost:3001`, and `laughtrack://`
- **Mobile routes** (`/api/mobile/*`): Accepts only `laughtrack://`
- **Web routes** (`/api/web/*`): Accepts `CORS_ORIGIN` and `http://localhost:3001`

## Global Middleware (applied to all routes)

1. Security headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`
2. Request logger
3. Error handler

## Auth Middleware Reference

- `authMiddleware` — Populates `c.get('user')` and `c.get('session')` if authenticated; allows request to continue if not.
- `requireAuth` — Returns 401 if not authenticated; populates user/session if valid.
- `requireAdmin` — Returns 401 if not authenticated, 403 if user lacks `admin` role; populates user/session if valid.
