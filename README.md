# Thabit (ثابت) - Quran Companion

Thabit helps you build a steady Qur'an habit: daily reading, streaks, journaling, bookmarks, stats, mood calendar tracking, and gentle AI reflections.

| Layer | Stack |
|-------|--------|
| Frontend | React 19, Vite, Tailwind CSS 4, React Router 7, GSAP |
| Backend | Vercel serverless functions under `/api` |
| Data | MongoDB Atlas |
| Auth | Cookie sessions (argon2id + JWT access / refresh) |

Documentation guides:
- [FRONTEND.md](./FRONTEND.md) - React 19 SPA architecture, page breakdown, mood calendar, and client features
- [BACKEND.md](./BACKEND.md) - Serverless API routes, auth model, database schemas, and env variables

---

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** 10+
- **MongoDB Atlas** cluster (or any MongoDB URI)
- Optional for full local API: [Vercel CLI](https://vercel.com/docs/cli) (`npm i -g vercel`)
- Optional: Quran Foundation API credentials, Gemini API key

---

## Quick start

### 1. Clone and install

```bash
git clone https://github.com/zaidharissheikh/Thabit-Quran-Companion.git
cd Thabit-Quran-Companion
npm install
```

### 2. Environment

```bash
cp .env.example .env
```

Fill at least:

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | Atlas connection string |
| `MONGODB_DB` | Database name (default `thabit`) |
| `JWT_ACCESS_SECRET` | ≥ 32 random characters |
| `JWT_REFRESH_SECRET` | Different ≥ 32 random characters |
| `CORS_ORIGINS` | Include `http://localhost:5173` |
| `COOKIE_SECURE` | `false` for local HTTP |

AI (`AI_API_KEY`) and Quran Foundation (`QF_PRELIVE_*`) unlock reflect / chapter features; the app still runs without them for core auth and progress.

### 3. Database indexes (once)

```bash
npm run db:indexes
```

### 4. Run locally

**Recommended (frontend + `/api` together):**

```bash
npx vercel dev
```

Open the URL Vercel prints (often `http://localhost:3000`).

**Split terminals (Vite HMR + API):**

```bash
# Terminal A: API
npx vercel dev

# Terminal B: Vite (proxies /api -> :3000)
npm run dev
```

Vite defaults to `http://localhost:5173` and proxies `/api` to `http://127.0.0.1:3000` (see `vite.config.js`).

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite frontend with HMR |
| `npm run build` | Production frontend build -> `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint |
| `npm test` | Vitest (unit + API integration) |
| `npm run test:watch` | Vitest watch mode |
| `npm run db:indexes` | Create MongoDB indexes from `.env` |

---

## Project layout

```text
├── api/                 # Vercel serverless handlers + _lib helpers
├── public/              # Static assets (logo, favicon)
├── scripts/             # One-off tools (indexes, walkthroughs)
├── src/                 # React app
│   ├── assets/          # Avatars, mood stickers, nav config, images
│   ├── components/      # Shared UI (BottomNav, MoodCalendar, HeartRating)
│   ├── data/            # Surah metadata, juz, royal counsel quotes
│   ├── lib/             # Client API, validation, audio cache & day helpers
│   └── pages/           # Routes (home, reader, surah, stats, journal, auth)
├── tests/               # Vitest unit + integration tests
├── .env.example         # Env template (safe to commit)
├── FRONTEND.md          # Frontend architecture reference
├── BACKEND.md           # Auth, endpoints, env reference
├── vercel.json          # Headers / CSP / SPA routing rules
└── vite.config.js       # Dev proxy for /api
```

---

## Development notes

- **Secrets** stay in `.env` / Vercel project settings - never commit `.env`.
- **Auth cookies** are `httpOnly`; the browser client always uses `credentials: 'include'`.
- **Signup rules** (frontend + `/api/auth/register`): strong password (8-20 chars, upper/lower/digit/special), valid email, name, date of birth (age 11+).
- **Theme / typography**: Display settings; ayah Arabic & translation sizes use CSS variables on Home, Surah, and Play.
- **Verse counts**: unique ayahs from Play (audio ended) or Mark read - not the daily goal value.
- **Icons**: Font Awesome 6 (CDN) for sidebar / bottom nav.

---

## Testing

```bash
npm test
```

Integration tests use `mongodb-memory-server` (first run downloads a MongoDB binary and caches it). Quran Foundation and Gemini network calls are mocked in tests.

---

## Deploy (Vercel)

1. Import the GitHub repo into Vercel.
2. Copy variables from `.env.example` into **Project -> Settings -> Environment Variables** (Production + Preview as needed).
3. Set `COOKIE_SECURE=true` and production `CORS_ORIGINS` for the live domain.
4. Deploy. Run `npm run db:indexes` against Atlas once if indexes are not already created.

---

## Contributing

1. Create a branch from `master` (or your team's default).
2. Keep changes focused; match existing naming and UI patterns.
3. Run `npm run lint` and `npm test` before opening a PR.
4. Do not commit secrets, local `.env`, or `node_modules`.
