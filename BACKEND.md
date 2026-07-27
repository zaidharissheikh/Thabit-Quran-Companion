# Thabit Backend (Vercel Serverless + MongoDB Atlas)

Lightweight Node.js API under `/api`. No Express process. Secrets live only in environment variables.

## Setup

1. Create a MongoDB Atlas free cluster and copy the connection URI.
2. Copy env template and fill values:

   ```bash
   cp .env.example .env
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create indexes once (script loads repo-root `.env` via `dotenv`):

   ```bash
   npm run db:indexes
   ```

5. Local API + frontend:

   ```bash
   npx vercel dev
   ```

   Or run Vite (`npm run dev`) with the `/api` proxy (see `vite.config.js`) pointing at `vercel dev` on port 3000.

6. Run tests (in-memory Mongo via `mongodb-memory-server`; first run downloads a MongoDB binary and caches it):

   ```bash
   npm test
   ```

   - Unit: `tests/auth.test.js`, `tests/errors.test.js`
   - Integration: `tests/integration/*.test.js` (handlers invoked in-process; QF/Gemini network mocked)

## Vercel environment variables

Set these in the Vercel project settings (Production + Preview as noted).

| Variable | Required | Notes |
|----------|----------|--------|
| `MONGODB_URI` | Yes | Atlas connection string |
| `MONGODB_DB` | No | Default `thabit` |
| `JWT_ACCESS_SECRET` | Yes | ≥ 32 chars |
| `JWT_REFRESH_SECRET` | Yes | ≥ 32 chars, different from access |
| `CORS_ORIGINS` | Yes | Comma-separated, e.g. `https://thabit.vercel.app,http://localhost:5173` |
| `COOKIE_SECURE` | Prod: `true` | Use `false` only for local HTTP |
| `QF_PRELIVE_CLIENT_ID` | Yes (dev/preview) | Quran Foundation prelive |
| `QF_PRELIVE_CLIENT_SECRET` | Yes (dev/preview) | Server only |
| `QF_PROD_CLIENT_ID` | Yes (production) | Used when `VERCEL_ENV=production` |
| `QF_PROD_CLIENT_SECRET` | Yes (production) | Server only |
| `AI_API_KEY` | Recommended | Gemini key (server-side) |
| `QF_ENV` | No | Set `production` to force Quran.com production credentials locally |
| `QURAN_TRANSLATION_ID` | No | Default `20` (Sahih International) |

**QF environment selection:** local and Vercel Preview always use the **prelive** credential set. Vercel Production (`VERCEL_ENV=production`) uses the **prod** credential set. Optional override: `QF_ENV=production`.

## Auth model

- Passwords: **argon2id** (`@node-rs/argon2` for cross-platform Vercel compatibility)
- Access JWT (~15m) in `thabit_access` cookie (`httpOnly`, `Secure` in prod, `SameSite=Strict`, `Path=/`)
- Refresh token (~7d) in `thabit_refresh` cookie (`Path=/api/auth`, hashed with SHA-256 in Mongo)
- Protected routes: verify JWT **and** allowlisted `Origin` / `Referer`
- Client must call APIs with `credentials: 'include'` - **never** store tokens in `localStorage`

## Endpoints

Error shape (all failures):

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Invalid request" } }
```

### Health (extra utility)

- `GET /api/health` - config readiness flags (no secrets)

### Auth

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/api/auth/register` | Origin + IP rate limit | Sets cookies; seeds progress |
| POST | `/api/auth/login` | Origin + IP rate limit | Sets cookies |
| POST | `/api/auth/refresh` | Origin + refresh cookie | Rotates tokens |
| POST | `/api/auth/logout` | Origin | Clears cookies + refresh hash |
| GET | `/api/auth/me` | Access cookie + Origin | Current user |

### Progress

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/progress` | Yes - seeds defaults on first read |
| PUT / PATCH | `/api/progress` | Yes |

### Bookmarks

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/bookmarks?page=&limit=` | Yes (paginated) |
| POST | `/api/bookmarks` | Yes |
| GET / PATCH / DELETE | `/api/bookmarks/:id` | Yes (scoped to JWT user) |

### Notes (journal)

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/notes?page=&limit=` | Yes |
| POST | `/api/notes` | Yes |
| GET / PATCH / DELETE | `/api/notes/:id` | Yes |

### Quran (public, IP rate-limited, Mongo-cached)

| Method | Path |
|--------|------|
| GET | `/api/quran/chapters` |
| GET | `/api/quran/chapters/:id` |
| GET | `/api/quran/chapters/:id/verses?page=&per_page=&translations=` |

Upstream: Quran Foundation Content API via OAuth2 **client_credentials** (`scope=content`). Access tokens are cached on `globalThis` (~1h, refresh 30s early) with single-flight; content responses cached in Mongo with TTL.

### AI

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/ai/reflect` | Yes + per-user rate limit |

Body: `{ "prompt": "...", "maxTokens": 180, "context": { "name", "streak", ... } }`

## Folder layout

```text
api/
  _lib/          # shared modules (not routes)
  auth/
  progress/
  bookmarks/
  notes/
  quran/
  ai/
  health.js
scripts/setup-indexes.mjs
tests/
BACKEND.md
FRONTEND.md
README.md
vercel.json
```
