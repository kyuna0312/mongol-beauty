# Production Deployment Design

**Date:** 2026-04-16
**Project:** Mongol Beauty (mcosmetic.mn)
**Scope:** Production-ready Docker Compose deployment on a single VPS with nginx-proxy + SSL, and a weekly automated database backup.

---

## 1. Goals

- Deploy the full monorepo (API gateway + order service + payment service + React frontend + PostgreSQL) to a single VPS using Docker Compose.
- Serve `mcosmetic.mn` (frontend) and `api.mcosmetic.mn` (backend) over HTTPS with auto-renewing Let's Encrypt certificates.
- Run a weekly PostgreSQL dump every Saturday at 23:59:00, saving compressed files to `/var/backups/mongol-beauty/` on the host filesystem.
- Leave the existing `docker-compose.yml` (local dev) untouched.

---

## 2. Container Architecture

```
Internet (:80 / :443)
    │
    ▼
nginx-proxy           ← routes requests by VIRTUAL_HOST env var
acme-companion        ← issues and auto-renews Let's Encrypt certs
    │
    ├── web (nginx:alpine)          → mcosmetic.mn
    │     serves pre-built Vite static files
    │
    └── gateway (NestJS :4000)      → api.mcosmetic.mn
          │
          ├── order-service (:4010)
          ├── payment-service (:4020)
          └── postgres (:5432)

db-backup (postgres:15-alpine)
    │
    └── bind mount → /var/backups/mongol-beauty/ on host
```

All containers share a single Docker bridge network `mongol-beauty-prod-network`.

---

## 3. New Files

| File | Purpose |
|---|---|
| `apps/api/Dockerfile` | Multi-stage: build NestJS → minimal production image |
| `apps/web/Dockerfile` | Multi-stage: `yarn build` → nginx static serving |
| `apps/web/nginx.conf` | React Router support, gzip, cache headers |
| `docker-compose.prod.yml` | Full production stack |
| `.env.prod.example` | Production env template with all required vars |
| `scripts/setup-server.sh` | One-time VPS setup (dirs, network, env file) |
| `scripts/deploy.sh` | Pull → build → up → migrate |
| `scripts/db-backup.sh` | pg_dump + rotation logic |

---

## 4. Dockerfiles

### `apps/api/Dockerfile`

Two stages:

**Stage 1 — builder** (`node:20-alpine`):
- Copy monorepo root files (`package.json`, `yarn.lock`, `tsconfig.base.json`, `packages/`)
- Copy `apps/api/`
- Run `yarn install --frozen-lockfile`
- Run `yarn workspace @mongol-beauty/api build` → produces `apps/api/dist/`

**Stage 2 — runner** (`node:20-alpine`):
- Copy `node_modules/`, `dist/`, and `packages/` from builder
- Create non-root user `node`, run as `node`
- `EXPOSE 4000`
- `CMD ["node", "apps/api/dist/main.js"]`

### `apps/web/Dockerfile`

Two stages:

**Stage 1 — builder** (`node:20-alpine`):
- Copy full monorepo
- Set build arg `VITE_GRAPHQL_URL=https://api.mcosmetic.mn/graphql`
- Run `yarn install --frozen-lockfile`
- Run `yarn workspace @mongol-beauty/web build` → produces `apps/web/dist/`

**Stage 2 — runner** (`nginx:alpine`):
- Copy `apps/web/dist/` to `/usr/share/nginx/html`
- Copy `apps/web/nginx.conf` to `/etc/nginx/conf.d/default.conf`
- `EXPOSE 80`

### `apps/web/nginx.conf`

- `root /usr/share/nginx/html`
- `try_files $uri $uri/ /index.html` — fixes React Router 404s on direct URL access
- `gzip on` with common MIME types
- Long-lived cache headers (`Cache-Control: max-age=31536000, immutable`) for hashed asset files
- Short cache for `index.html` (`no-cache`)

---

## 5. `docker-compose.prod.yml`

### nginx-proxy + acme-companion

```yaml
nginx-proxy:
  image: nginxproxy/nginx-proxy:alpine
  ports: ["80:80", "443:443"]
  volumes:
    - certs:/etc/nginx/certs
    - vhost:/etc/nginx/vhost.d
    - html:/usr/share/nginx/html
    - /var/run/docker.sock:/tmp/docker.sock:ro

acme-companion:
  image: nginxproxy/acme-companion
  volumes_from: [nginx-proxy]
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock:ro
    - acme:/etc/acme.sh
  environment:
    DEFAULT_EMAIL: ${LETSENCRYPT_EMAIL}
```

### web container

```yaml
web:
  build: { context: ., dockerfile: apps/web/Dockerfile }
  environment:
    VIRTUAL_HOST: ${DOMAIN}           # mcosmetic.mn
    LETSENCRYPT_HOST: ${DOMAIN}
  depends_on: [nginx-proxy]
```

### gateway container

```yaml
gateway:
  build: { context: ., dockerfile: apps/api/Dockerfile }
  environment:
    NODE_ENV: production
    SERVICE_MODE: gateway
    PORT: 4000
    VIRTUAL_HOST: ${API_DOMAIN}       # api.mcosmetic.mn
    LETSENCRYPT_HOST: ${API_DOMAIN}
    VIRTUAL_PORT: 4000
    DB_SYNCHRONIZE: "false"
    # ... DB, JWT, service URLs
  volumes:
    - uploads_data:/app/uploads
```

Order-service and payment-service follow the same pattern without `VIRTUAL_HOST` (internal only, not exposed to internet).

### db-backup container

```yaml
db-backup:
  image: postgres:15-alpine
  volumes:
    - /var/backups/mongol-beauty:/backups
    - ./scripts/db-backup.sh:/scripts/db-backup.sh:ro
  environment:
    PGPASSWORD: ${DB_PASSWORD}
    DB_HOST: postgres
    DB_USER: ${DB_USER}
    DB_NAME: ${DB_NAME}
  entrypoint: ["/bin/sh", "-c"]
  command: >
    "echo '59 23 * * 6 /scripts/db-backup.sh >> /backups/backup.log 2>&1' | crontab -
    && crond -f -l 2"
  depends_on: [postgres]
```

`scripts/db-backup.sh` is bind-mounted read-only from the repo — no custom Dockerfile needed. The entrypoint registers the crontab and starts `crond` in the foreground.

### Named volumes

```yaml
volumes:
  postgres_data:
  uploads_data:      # payment receipt images — persists across deploys
  certs:             # SSL certificates
  vhost:             # nginx-proxy vhost configs
  html:              # nginx-proxy challenge files
  acme:              # acme.sh state
```

---

## 6. Production Environment (`.env.prod.example`)

```env
# Domains
DOMAIN=mcosmetic.mn
API_DOMAIN=api.mcosmetic.mn
LETSENCRYPT_EMAIL=your@email.com

# Database
DB_USER=mongol_beauty_prod
DB_PASSWORD=<strong-random-password>
DB_NAME=mongol_beauty
DB_PORT=5432

# App secrets
JWT_SECRET=<64-char-random-string>
INTERNAL_SERVICE_TOKEN=<32-char-random-string>

# CORS
FRONTEND_URL=https://mcosmetic.mn

# Production flags
NODE_ENV=production
DB_SYNCHRONIZE=false
```

---

## 7. Weekly Database Backup (`scripts/db-backup.sh`)

- **Schedule:** `59 23 * * 6` (every Saturday at 23:59:00)
- **Tool:** `pg_dump` with `--clean --if-exists --no-owner` flags
- **Format:** gzip-compressed SQL → `mongol_beauty_YYYY-MM-DD_2359.sql.gz`
- **Output path:** `/backups/` inside container = `/var/backups/mongol-beauty/` on host
- **Retention:** Delete files older than 56 days (keeps ~8 weekly dumps)
- **Logging:** Append result (success/failure + timestamp + file size) to `/backups/backup.log`

Restore command (documented in script header):
```bash
gunzip -c mongol_beauty_YYYY-MM-DD_2359.sql.gz | psql -U $DB_USER -d $DB_NAME
```

---

## 8. Deployment Scripts

### `scripts/setup-server.sh` (run once on fresh VPS)

1. Create `/var/backups/mongol-beauty/` with correct permissions
2. Create Docker network `mongol-beauty-prod-network`
3. Copy `.env.prod.example` → `.env.prod` if not exists
4. Print reminder to fill in secrets

### `scripts/deploy.sh` (run on each release)

1. `git pull origin main`
2. `docker compose -f docker-compose.prod.yml --env-file .env.prod build --no-cache`
3. `docker compose -f docker-compose.prod.yml --env-file .env.prod up -d`
4. Wait for gateway health check
5. Run TypeORM migrations: `docker compose -f docker-compose.prod.yml --env-file .env.prod exec gateway yarn workspace @mongol-beauty/api migration:run`

---

## 9. Production Security Checklist

- `DB_SYNCHRONIZE=false` — no auto-schema changes in production
- GraphQL introspection disabled (existing code handles this via `NODE_ENV=production`)
- Non-root user in API container
- `INTERNAL_SERVICE_TOKEN` is a strong random string (not `dev-internal-token`)
- `.env.prod` is in `.gitignore`
- Admin panel has no auth in MVP — access via VPN or IP allowlist recommended

---

## 10. Out of Scope

- CI/CD pipeline (GitHub Actions) — future work
- Off-server backup storage (S3/R2) — future work
- Admin panel authentication — separate feature
- Horizontal scaling / load balancing — not needed at this stage
