# Local development setup

Monorepo: **React (Vite)** + **NestJS (Apollo GraphQL)** + **PostgreSQL** (Docker).

## Prerequisites

- Docker (or Docker Desktop) with Compose
- Node.js 18+ (20+ recommended)
- `npm` or `yarn` (package manager is `yarn@1` in `package.json`; `npm` works with workspaces)

## 1. Environment files

From the repo root:

```bash
npm run setup-env
```

Or manually:

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

- **Root `.env`** — `DB_*` for Docker Compose (see `docker-compose.yml`).
- **`apps/api/.env`** — NestJS, DB connection, JWT, CORS. Must match Docker DB credentials.
- **`apps/web/.env`** — optional; leave `VITE_GRAPHQL_URL` unset in dev to use the Vite `/graphql` proxy.

## 2. Start PostgreSQL

```bash
npm run docker:up
# or: yarn docker:up
# or: ./scripts/docker-compose.sh up -d
```

Wait until healthy:

```bash
npm run db:wait
```

Logs: `npm run docker:logs` · Stop: `npm run docker:down` · **Remove data volume:** `npm run docker:clean`

## 3. Database schema

**Local default (development):** TypeORM `synchronize` is **on** when `NODE_ENV !== production` and `DB_SYNCHRONIZE` is not set to `false`. The API creates/updates tables from entities on startup.

**Migrations (production-style or explicit schema):**

```bash
cd apps/api
npm run migration:generate -- src/migrations/DescribeYourChange
npm run migration:run
```

From repo root (workspace):

```bash
npm run migration:run -w @mongol-beauty/api
```

If you use migrations only, set `DB_SYNCHRONIZE=false` in `apps/api/.env` and run migrations before the app.

## 4. Seed & admin (optional)

```bash
npm run seed
npm run create-admin
```

## 5. Run API + web

**Terminal (recommended):** one command that waits for Postgres then starts both apps:

```bash
npm run dev:full
# or: yarn dev:full
```

**Or** separately:

```bash
npm run docker:up
npm run db:wait
```

Then:

```bash
# Terminal 1
npm run dev:api
# or: yarn dev:api

# Terminal 2
npm run dev:web
# or: yarn dev:web
```

| Service    | URL                         |
|-----------|-----------------------------|
| Frontend  | http://localhost:5173       |
| GraphQL   | http://localhost:4000/graphql |
| Health    | http://localhost:4000/health (if enabled) |

## 6. How the frontend talks to the API

- **Development:** Vite proxies `/graphql` → `http://localhost:4000` (see `apps/web/vite.config.ts`). Apollo uses the relative URL `/graphql` when `VITE_GRAPHQL_URL` is unset.
- **Production build:** point `VITE_GRAPHQL_URL` at your deployed API (e.g. `https://api.example.com/graphql`).

## 7. Troubleshooting

| Issue | What to try |
|-------|-----------|
| `ECONNREFUSED` on DB | `docker ps` — ensure `mongol-beauty-db` is up; `npm run db:wait` |
| Port 5432 in use | Change `DB_PORT` in `.env` and `apps/api/.env` (same value) |
| CORS errors | Set `FRONTEND_URL` in `apps/api/.env` to your Vite origin |
| GraphQL 404 in dev | Use `/graphql` or proxy; ensure API is on port `4000` |

## 8. Workflow tips

- Use **`npm run dev:full`** (or `yarn dev:full`) instead of `sleep` + dev — it runs `db:wait` after Docker.
- Keep **root `.env` and `apps/api/.env` DB credentials aligned** with Compose.
- Prefer **migrations** for anything beyond local experiments; keep **`synchronize` off** in production (`NODE_ENV=production` already disables it unless overridden).
- Run **`npm run docker:clean`** only when you want a **fresh empty database** (deletes the volume).
