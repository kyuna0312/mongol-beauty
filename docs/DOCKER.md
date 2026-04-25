# Docker Guide

Three Compose files cover every environment.

| File | Purpose | Who uses it |
|------|---------|-------------|
| `docker-compose.yml` | PostgreSQL only | Developers running API/web on the host |
| `docker-compose.local.yml` | Full stack (built images, local) | Testing the full stack without installing Node |
| `docker-compose.prod.yml` | Full stack (production) | Server / CI deployment |

---

## docker-compose.yml — database only

The default compose file. Starts only PostgreSQL so you can run the API and web from your terminal with hot-reload.

```bash
# Start Postgres
yarn docker:up

# Run API + web with hot-reload
yarn dev:full

# Stop Postgres
yarn docker:down

# Wipe the database volume (fresh start)
yarn docker:clean
```

Postgres is exposed on `localhost:5432` and the API connects to it via `DB_HOST=localhost` in `apps/api/.env`.

---

## docker-compose.local.yml — full local stack

Builds and runs the **complete stack** (Postgres + order-service + payment-service + gateway + web) entirely inside Docker. No Node.js installation needed on the host.

**URLs after startup:**

| Service | URL |
|---------|-----|
| Web (React) | http://localhost:3000 |
| GraphQL playground | http://localhost:4000/graphql |
| Health | http://localhost:4000/health |
| Order service | http://localhost:4010/health |
| Payment service | http://localhost:4020/health |

### First run

```bash
docker compose -f docker-compose.local.yml up --build -d
```

The `--build` flag builds all images from source. Subsequent starts without code changes are fast:

```bash
docker compose -f docker-compose.local.yml up -d
```

### Rebuild after code changes

```bash
# Rebuild all images
docker compose -f docker-compose.local.yml up --build -d

# Rebuild only the API (gateway, order-service, payment-service share one image)
docker compose -f docker-compose.local.yml build gateway
docker compose -f docker-compose.local.yml up -d gateway order-service payment-service

# Rebuild only the web
docker compose -f docker-compose.local.yml build web
docker compose -f docker-compose.local.yml up -d web
```

### View logs

```bash
# All services
docker compose -f docker-compose.local.yml logs -f

# Single service
docker compose -f docker-compose.local.yml logs -f gateway
docker compose -f docker-compose.local.yml logs -f web
```

### Seed demo data

The database auto-syncs schema on startup (`DB_SYNCHRONIZE=true`). To add demo products and admin user:

```bash
# Seed must run against the local Postgres (exposed on port 5432)
yarn seed
yarn create-admin
```

### Stop and clean up

```bash
# Stop containers (keep volumes)
docker compose -f docker-compose.local.yml down

# Stop and delete all data (volumes)
docker compose -f docker-compose.local.yml down -v
```

### Receipt uploads in local mode

Payment receipts are stored inside the container at `/app/uploads/receipts` and mounted to the `mb_local_uploads_data` volume. They are served through the gateway at `http://localhost:4000/uploads/receipts/<filename>`.

To test R2 storage locally, add these to a `.env.local` file or export them, then set `RECEIPT_STORAGE_DRIVER=r2`:

```bash
RECEIPT_STORAGE_DRIVER=r2
CF_R2_ACCOUNT_ID=your-account-id
CF_R2_ACCESS_KEY_ID=your-key
CF_R2_SECRET_ACCESS_KEY=your-secret
CF_R2_BUCKET=mongol-beauty-receipts
CF_R2_PUBLIC_URL=https://pub-xxx.r2.dev
```

Then uncomment the `CF_R2_*` lines in `docker-compose.local.yml` and restart:

```bash
docker compose -f docker-compose.local.yml up -d payment-service gateway
```

---

## docker-compose.prod.yml — production

Full production stack with nginx-proxy, automatic TLS via Let's Encrypt, and Cloudflare R2 receipt storage.

### Prerequisites on the server

- A VPS or VM with Docker + Compose installed
- Domain DNS A-records pointing to the server's IP:
  - `mcosmetics.mn` → server IP (serves both web and `/graphql`)
- Ports 80 and 443 open in firewall

### Environment setup

```bash
cp .env.prod.example .env.prod
```

Fill in every value. The required variables:

```bash
# Domain
DOMAIN=mcosmetics.mn
FRONTEND_URL=https://mcosmetics.mn
LETSENCRYPT_EMAIL=you@example.com

# Database (use strong random values)
DB_USER=mongol_beauty_prod
DB_PASSWORD=<openssl rand -hex 16>
DB_NAME=mongol_beauty

# Secrets (generate with: openssl rand -hex 32)
JWT_SECRET=<64-char-hex>
INTERNAL_SERVICE_SECRET=<64-char-hex>

# Cloudflare R2
RECEIPT_STORAGE_DRIVER=r2
CF_R2_ACCOUNT_ID=<from Cloudflare Dashboard>
CF_R2_ACCESS_KEY_ID=<R2 API token key>
CF_R2_SECRET_ACCESS_KEY=<R2 API token secret>
CF_R2_BUCKET=mongol-beauty-receipts
CF_R2_PUBLIC_URL=https://uploads.mcosmetics.mn

# Backup directory on the host
BACKUP_DIR=/home/ubuntu/backups/mongol-beauty
```

### Deploy

```bash
# On the server — clone the repo, then:
docker compose -f docker-compose.prod.yml --env-file .env.prod up --build -d
```

Migrations run automatically via the `migrator` service before the API starts.

### Update after a code push

```bash
git pull
docker compose -f docker-compose.prod.yml --env-file .env.prod up --build -d
```

### Check status

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f gateway
```

---

## Cloudflare R2 setup

R2 is an S3-compatible object store with no egress fees. Receipts are uploaded directly from the payment-service and served via a public bucket URL.

### 1. Create a bucket

Cloudflare Dashboard → R2 → **Create bucket**. Name it `mongol-beauty-receipts` (or anything — set `CF_R2_BUCKET` to match).

### 2. Enable public access

Inside the bucket → **Settings** → **Public access** → **Allow access**. Copy the `r2.dev` URL or connect your own domain (e.g. `uploads.mcosmetics.mn`) via a CNAME in Cloudflare DNS. This URL becomes `CF_R2_PUBLIC_URL`.

### 3. Create an API token

Dashboard → R2 → **Manage R2 API Tokens** → **Create API Token**.

- Permissions: **Object Read & Write**
- Scope: specific bucket (`mongol-beauty-receipts`)

Copy the **Access Key ID** → `CF_R2_ACCESS_KEY_ID`  
Copy the **Secret Access Key** → `CF_R2_SECRET_ACCESS_KEY`  
Copy the **Account ID** (top-right of any R2 page) → `CF_R2_ACCOUNT_ID`

### 4. Verify

Upload a test receipt via the checkout page and confirm the image loads from `CF_R2_PUBLIC_URL/receipts/...`.

---

## Dockerfile overview

### `apps/api/Dockerfile`

Two-stage build:

1. **Builder** — installs all deps, compiles TypeScript to `apps/api/dist/`
2. **Runner** — copies only `dist/` + `node_modules`, runs as non-root `app` user

All three API services (gateway, order-service, payment-service) use the same image. `SERVICE_MODE` env var determines which modules load at startup.

### `apps/web/Dockerfile`

Two-stage build:

1. **Builder** — runs `yarn build`, bakes `VITE_GRAPHQL_URL` into the static bundle
2. **Runner** — nginx serves `dist/`, proxies `/graphql` → gateway, `/uploads` → gateway

`VITE_GRAPHQL_URL` is a **build-time** arg — changing it requires rebuilding the image.

---

## Common issues

| Symptom | Fix |
|---------|-----|
| `web` container exits on start | Gateway not healthy yet — `--build` then wait for healthcheck |
| `ECONNREFUSED` to postgres | Postgres healthcheck not passed — check `docker compose logs postgres` |
| GraphQL playground shows network error | `FRONTEND_URL` not set or CORS mismatch — check gateway env |
| Receipt upload returns 500 | Missing `CF_R2_*` env vars when `RECEIPT_STORAGE_DRIVER=r2` |
| Old image used after code change | Run `--build` flag or `docker compose build` explicitly |
| Port already in use | Change `DB_PORT`, `3000`, or `4000` in compose override |
