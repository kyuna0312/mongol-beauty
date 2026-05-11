# Local Setup

Monorepo: **React (Vite)** + **NestJS (Apollo GraphQL)** + **PostgreSQL** (Docker).

## Prerequisites

- Node.js 20+
- Yarn 1.22+
- Docker with Compose

## 1. Environment files

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
```

Or use the automated setup:

```bash
yarn setup
```

- **Root `.env`** — `DB_*` for Docker Compose
- **`apps/api/.env`** — NestJS DB connection, JWT secret, CORS. Must match root `.env` DB credentials.
- **`apps/web/.env`** — optional; leave `VITE_GRAPHQL_URL` unset in dev to use the Vite `/graphql` proxy

## 2. Start PostgreSQL

```bash
yarn docker:up
```

Wait until the container is healthy:

```bash
yarn db:wait
```

Other DB commands:

```bash
yarn docker:logs   # View logs
yarn docker:down   # Stop
yarn docker:clean  # Wipe data volume (destructive — fresh start)
```

## 3. Database schema

In development, TypeORM `synchronize` is on by default — the API creates and updates tables from entities on startup. No migration step needed for local dev.

To use migrations explicitly (production-style):

```bash
# Generate from entity changes
npm run migration:generate -w @mongol-beauty/api -- src/migrations/DescribeYourChange

# Run pending migrations
yarn db:migrate
```

Set `DB_SYNCHRONIZE=false` in `apps/api/.env` if you want migration-only mode locally.

## 4. Seed and demo accounts (optional)

```bash
yarn seed              # Demo products and categories
yarn create-admin      # Admin account
yarn create-demo-user  # Storefront user
```

| Role | Login URL | Email | Password |
|------|-----------|-------|----------|
| Admin | `/admin/login` | `admin@incellderm.mn` | `admin123` |
| Storefront user | `/login` | `demo@mongol-beauty.local` | `demo1234` |

Override defaults via `apps/api/.env`: `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `DEMO_USER_EMAIL`, `DEMO_USER_PASSWORD`.

If accounts already exist, the scripts update the password to match the env (or defaults).

## 5. Run API + web

```bash
yarn dev:full
```

Or separately:

```bash
# Terminal 1
yarn dev:api

# Terminal 2
yarn dev:web
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| GraphQL | http://localhost:4000/graphql |
| Health | http://localhost:4000/health |

## 6. Frontend → API communication

- **Development**: Vite proxies `/graphql` → `http://localhost:4000` (see `apps/web/vite.config.ts`). Leave `VITE_GRAPHQL_URL` unset.
- **Production build**: set `VITE_GRAPHQL_URL` to the deployed API URL (e.g. `https://api.example.com/graphql`).

## 7. Troubleshooting

| Issue | Fix |
|-------|-----|
| `ECONNREFUSED` on DB | Run `docker ps` to confirm `mongol-beauty-db` is up; run `yarn db:wait` |
| Port 5432 in use | Change `DB_PORT` in `.env` and `apps/api/.env` (same value in both) |
| CORS errors | Set `FRONTEND_URL` in `apps/api/.env` to your Vite origin |
| GraphQL 404 in dev | Ensure API is on port 4000 and `VITE_GRAPHQL_URL` is unset |

## 8. Tips

- Use `yarn dev:full` instead of starting services manually — it waits for Postgres before starting the API.
- Keep root `.env` and `apps/api/.env` DB credentials in sync with `docker-compose.yml`.
- Use migrations for anything beyond local experiments. `synchronize` is automatically off in production (`NODE_ENV=production`).
- `yarn docker:clean` deletes the DB volume — use only when you want a completely fresh database.
