# Laughtrack API Routes

Base URL: `http://localhost:3000` (configurable via `PORT` env var).

## Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Returns `{ status: "ok", timestamp }` |

## Auth — `/api/auth/*`

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

## Sync — `/api/sync/*`

WatermelonDB-compatible sync protocol. All endpoints require `requireAuth`.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/sync/pull?last_pulled_at=<timestamp>` | `requireAuth` | Pull changes since timestamp. Returns `{ changes: { jokes, joke_sets, joke_set_items, audio_recordings, tags, joke_tags }, timestamp }`. Each table has `{ created, updated, deleted }`. First pull (no timestamp) returns all records. Audio recordings have `file_path` stripped. |
| POST | `/api/sync/push` | `requireAuth` | Push local changes. Body: `{ changes: { [tableName]: { created?, updated?, deleted? } }, lastPulledAt }`. Runs in a transaction. Uses upsert (INSERT ON CONFLICT UPDATE). Conflict detection: if server `lastModified > lastPulledAt`, returns 409. Soft deletes set `isDeleted: true`. |

### Sync Tables
`jokes`, `joke_sets`, `joke_set_items`, `audio_recordings`, `tags`, `joke_tags`

### Field Mapping
Client uses snake_case, Drizzle uses camelCase. Mapped fields:
`contentHtml↔content_html`, `contentText↔content_text`, `draftUpdatedAt↔draft_updated_at`, `createdAt↔created_at`, `updatedAt↔updated_at`, `setId↔set_id`, `itemType↔item_type`, `jokeId↔joke_id`, `tagId↔tag_id`, `filePath↔file_path`, `remoteUrl↔remote_url`.

Internal fields stripped from sync: `userId`, `serverCreatedAt`, `lastModified`, `isDeleted` (server-side); `_status`, `_changed` (client-side).

## Audio — `/api/audio/*`

Cloudflare R2 presigned URL management. All endpoints require `requireAuth`.

| Method | Path | Auth | Body | Description |
|--------|------|------|------|-------------|
| POST | `/api/audio/upload-url` | `requireAuth` | `{ recordingId }` | Generates a presigned PUT URL for uploading audio to R2. Verifies recording exists and belongs to user. Returns `{ url, key, expiresIn: 600 }`. Content-Type: `audio/mp4`. |
| POST | `/api/audio/confirm-upload` | `requireAuth` | `{ recordingId, key }` | Confirms upload completed. Updates `remoteUrl` on the recording. Validates key matches expected format. Returns `{ ok: true }`. |
| POST | `/api/audio/download-url` | `requireAuth` | `{ recordingId }` | Generates a presigned GET URL for downloading audio from R2. Reconstructs key from userId+recordingId (prevents IDOR). Returns `{ url, expiresIn: 600 }`. |

## Runtime Detection — `/api/detect/*` (dev only)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/detect/runtime` | No | Returns runtime environment info (Bun version, Node version, Vercel detection). Only mounted when `NODE_ENV=development`. |

## Global Middleware (applied to all routes)

1. Security headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`
2. Request logger
3. CORS: origins `[CORS_ORIGIN, 'laughtrack://']`, credentials enabled
4. Error handler

## Auth Middleware Reference

- `authMiddleware` — Populates `c.get('user')` and `c.get('session')` if authenticated; allows request to continue if not.
- `requireAuth` — Returns 401 if not authenticated; populates user/session if valid.
