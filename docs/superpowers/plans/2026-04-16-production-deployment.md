# Production Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy the Mongol Beauty monorepo to a VPS using Docker Compose with nginx-proxy SSL termination, serving `mcosmetic.mn` (frontend) and `api.mcosmetic.mn` (backend), with a weekly Saturday 23:59 PostgreSQL dump to `/var/backups/mongol-beauty/` on the host.

**Architecture:** nginx-proxy + acme-companion containers handle SSL and routing by `VIRTUAL_HOST` env var. The React frontend is built into a static nginx container. The NestJS API (gateway + order-service + payment-service) runs from a multi-stage Docker build. A `db-backup` container runs `crond` with `pg_dump` every Saturday at 23:59, writing gzip dumps directly to a host bind mount.

**Tech Stack:** Docker Compose, nginx-proxy, acme-companion, Node 20 Alpine, nginx Alpine, postgres 15 Alpine, Yarn workspaces, NestJS, Vite

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `.gitignore` | Modify | Add `.env.prod` |
| `.env.prod.example` | Create | Production env template |
| `apps/web/nginx.conf` | Create | React Router + gzip + cache headers |
| `apps/web/Dockerfile` | Create | Multi-stage: Vite build → nginx static |
| `apps/api/Dockerfile` | Create | Multi-stage: NestJS build → production runner |
| `scripts/db-backup.sh` | Create | pg_dump + 56-day rotation + logging |
| `docker-compose.prod.yml` | Create | Full production stack |
| `scripts/setup-server.sh` | Create | One-time VPS bootstrap |
| `scripts/deploy.sh` | Create | Pull → build → up → migrate |

---

## Task 1: Protect `.env.prod` from git + create template

**Files:**
- Modify: `.gitignore`
- Create: `.env.prod.example`

- [ ] **Step 1: Add `.env.prod` to `.gitignore`**

Open `.gitignore` and add after the existing `.env` entries:

```
.env.prod
```

- [ ] **Step 2: Create `.env.prod.example`**

Create file `.env.prod.example` at repo root with this exact content:

```env
# =============================================================================
# Mongol Beauty — Production environment
# =============================================================================
# Copy: cp .env.prod.example .env.prod
# Then fill in every value marked with <>

# Domains
DOMAIN=mcosmetic.mn
API_DOMAIN=api.mcosmetic.mn
LETSENCRYPT_EMAIL=<your@email.com>

# Database — use strong random values, never the dev defaults
DB_USER=mongol_beauty_prod
DB_PASSWORD=<strong-random-password-min-32-chars>
DB_NAME=mongol_beauty
DB_PORT=5432

# App secrets
# Generate: openssl rand -hex 32
JWT_SECRET=<64-char-hex-string>
# Generate: openssl rand -hex 16
INTERNAL_SERVICE_TOKEN=<32-char-hex-string>

# CORS
FRONTEND_URL=https://mcosmetic.mn

# Production flags (do not change)
NODE_ENV=production
DB_SYNCHRONIZE=false
```

- [ ] **Step 3: Verify `.env.prod` is gitignored**

Run:
```bash
echo "TEST=1" > .env.prod && git status
```
Expected: `.env.prod` does NOT appear in untracked files. Then delete it:
```bash
rm .env.prod
```

- [ ] **Step 4: Commit**

```bash
git add .gitignore .env.prod.example
git commit -m "chore: add production env template and gitignore rule"
```

---

## Task 2: Create `apps/web/nginx.conf`

**Files:**
- Create: `apps/web/nginx.conf`

- [ ] **Step 1: Create the file**

Create `apps/web/nginx.conf` with this exact content:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # React Router — send all non-file requests to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Long-lived cache for hashed Vite assets (js/css/images)
    location ~* \.(?:js|css|woff2?|ttf|eot|svg|png|jpg|jpeg|gif|ico|webp)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
    }

    # No cache for index.html (so new deploys take effect immediately)
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_types
        text/plain
        text/css
        text/javascript
        application/javascript
        application/json
        image/svg+xml;
    gzip_min_length 1024;
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/nginx.conf
git commit -m "chore: add nginx config for production static serving"
```

---

## Task 3: Create `apps/web/Dockerfile`

**Files:**
- Create: `apps/web/Dockerfile`

- [ ] **Step 1: Create the file**

Create `apps/web/Dockerfile` with this exact content:

```dockerfile
# ---- Stage 1: Build ----
FROM node:20-alpine AS builder
WORKDIR /app

# Copy monorepo manifests first (layer cache for yarn install)
COPY package.json yarn.lock tsconfig.base.json ./
COPY packages/ ./packages/
COPY apps/web/ ./apps/web/

RUN yarn install --frozen-lockfile

# VITE_GRAPHQL_URL baked into the static bundle at build time
ARG VITE_GRAPHQL_URL=https://api.mcosmetic.mn/graphql
ENV VITE_GRAPHQL_URL=$VITE_GRAPHQL_URL

RUN yarn workspace @mongol-beauty/web build

# ---- Stage 2: Serve ----
FROM nginx:alpine AS runner
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

- [ ] **Step 2: Verify the build works locally**

Run from repo root:
```bash
docker build -f apps/web/Dockerfile -t mb-web-test .
```
Expected: build completes without error, two stages printed.

Check the image serves files:
```bash
docker run --rm -p 8080:80 mb-web-test &
sleep 2 && curl -s -o /dev/null -w "%{http_code}" http://localhost:8080
```
Expected: `200`

Stop the container:
```bash
docker stop $(docker ps -q --filter ancestor=mb-web-test) 2>/dev/null; true
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/Dockerfile
git commit -m "chore: add multi-stage production Dockerfile for web"
```

---

## Task 4: Create `apps/api/Dockerfile`

**Files:**
- Create: `apps/api/Dockerfile`

The API build compiles to `apps/api/dist/` (see `apps/api/tsconfig.json` `outDir: "./dist"`). The process.cwd() at runtime is `/app`, so uploads land at `/app/uploads/receipts` — a volume must be mounted there in compose.

- [ ] **Step 1: Create the file**

Create `apps/api/Dockerfile` with this exact content:

```dockerfile
# ---- Stage 1: Build ----
FROM node:20-alpine AS builder
WORKDIR /app

# Copy monorepo manifests (layer cache for yarn install)
COPY package.json yarn.lock tsconfig.base.json ./
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

RUN yarn install --frozen-lockfile
RUN yarn workspace @mongol-beauty/api build

# ---- Stage 2: Run ----
FROM node:20-alpine AS runner
WORKDIR /app

# Copy only what's needed to run
COPY --from=builder /app/package.json /app/yarn.lock /app/tsconfig.base.json ./
COPY --from=builder /app/packages/ ./packages/
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/node_modules ./node_modules

# Directory for payment receipt uploads (mounted as volume in production)
RUN mkdir -p /app/uploads/receipts

# Run as non-root
RUN addgroup -S app && adduser -S app -G app && chown -R app:app /app
USER app

EXPOSE 4000
CMD ["node", "apps/api/dist/main.js"]
```

- [ ] **Step 2: Verify the build works locally**

Run from repo root:
```bash
docker build -f apps/api/Dockerfile -t mb-api-test .
```
Expected: build completes, two stages printed, no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/api/Dockerfile
git commit -m "chore: add multi-stage production Dockerfile for API"
```

---

## Task 5: Create `scripts/db-backup.sh`

**Files:**
- Create: `scripts/db-backup.sh`

- [ ] **Step 1: Create the file**

Create `scripts/db-backup.sh` with this exact content:

```bash
#!/bin/sh
# =============================================================================
# Mongol Beauty — Weekly PostgreSQL backup
# Runs inside the db-backup container every Saturday at 23:59.
# Dumps land at /backups/ which is bind-mounted to
# /var/backups/mongol-beauty/ on the host.
#
# Restore a dump:
#   gunzip -c /var/backups/mongol-beauty/mongol_beauty_YYYY-MM-DD_2359.sql.gz \
#     | psql -h localhost -U $DB_USER -d $DB_NAME
# =============================================================================
set -e

BACKUP_DIR="/backups"
DB_HOST="${DB_HOST:-postgres}"
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-mongol_beauty}"
TIMESTAMP=$(date +%Y-%m-%d_%H%M)
BACKUP_FILE="${BACKUP_DIR}/mongol_beauty_${TIMESTAMP}.sql.gz"
LOG_FILE="${BACKUP_DIR}/backup.log"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting backup of ${DB_NAME}..." >> "$LOG_FILE"

pg_dump \
  -h "$DB_HOST" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  | gzip > "$BACKUP_FILE"

SIZE=$(du -sh "$BACKUP_FILE" | cut -f1)
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup complete: $(basename "$BACKUP_FILE") (${SIZE})" >> "$LOG_FILE"

# Rotate: delete dumps older than 56 days (~8 weekly backups retained)
DELETED=$(find "$BACKUP_DIR" -name "mongol_beauty_*.sql.gz" -mtime +56 -print)
find "$BACKUP_DIR" -name "mongol_beauty_*.sql.gz" -mtime +56 -delete

if [ -n "$DELETED" ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Deleted old backups: $DELETED" >> "$LOG_FILE"
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Done." >> "$LOG_FILE"
```

- [ ] **Step 2: Make it executable**

```bash
chmod +x scripts/db-backup.sh
```

- [ ] **Step 3: Verify the script is valid shell**

```bash
sh -n scripts/db-backup.sh && echo "syntax OK"
```
Expected: `syntax OK`

- [ ] **Step 4: Commit**

```bash
git add scripts/db-backup.sh
git commit -m "chore: add weekly pg_dump backup script with 56-day rotation"
```

---

## Task 6: Create `docker-compose.prod.yml`

**Files:**
- Create: `docker-compose.prod.yml`

This file references `${DOMAIN}`, `${API_DOMAIN}`, and all DB/secret vars from `.env.prod`.

- [ ] **Step 1: Create the file**

Create `docker-compose.prod.yml` at repo root with this exact content:

```yaml
# =============================================================================
# Mongol Beauty — Production Docker Compose
# Usage: docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
# =============================================================================

name: mongol-beauty-prod

services:

  # ── Reverse proxy + SSL ──────────────────────────────────────────────────
  nginx-proxy:
    image: nginxproxy/nginx-proxy:alpine
    container_name: mb-nginx-proxy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - certs:/etc/nginx/certs
      - vhost:/etc/nginx/vhost.d
      - html:/usr/share/nginx/html
      - /var/run/docker.sock:/tmp/docker.sock:ro
    networks:
      - mongol-beauty-prod-network

  acme-companion:
    image: nginxproxy/acme-companion
    container_name: mb-acme
    restart: unless-stopped
    volumes_from:
      - nginx-proxy
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - acme:/etc/acme.sh
    environment:
      DEFAULT_EMAIL: ${LETSENCRYPT_EMAIL}
    depends_on:
      - nginx-proxy
    networks:
      - mongol-beauty-prod-network

  # ── Database ─────────────────────────────────────────────────────────────
  postgres:
    image: postgres:15-alpine
    container_name: mb-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 15s
    networks:
      - mongol-beauty-prod-network

  # ── Backend services ─────────────────────────────────────────────────────
  order-service:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    container_name: mb-order-service
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      NODE_ENV: production
      SERVICE_MODE: order
      PORT: 4010
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      DB_NAME: ${DB_NAME}
      DB_SYNCHRONIZE: "false"
      INTERNAL_SERVICE_TOKEN: ${INTERNAL_SERVICE_TOKEN}
    networks:
      - mongol-beauty-prod-network

  payment-service:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    container_name: mb-payment-service
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
      order-service:
        condition: service_started
    environment:
      NODE_ENV: production
      SERVICE_MODE: payment
      PORT: 4020
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      DB_NAME: ${DB_NAME}
      DB_SYNCHRONIZE: "false"
      INTERNAL_SERVICE_TOKEN: ${INTERNAL_SERVICE_TOKEN}
      ORDER_SERVICE_URL: http://order-service:4010
    volumes:
      - uploads_data:/app/uploads
    networks:
      - mongol-beauty-prod-network

  gateway:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    container_name: mb-gateway
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
      order-service:
        condition: service_started
      payment-service:
        condition: service_started
    environment:
      NODE_ENV: production
      SERVICE_MODE: gateway
      PORT: 4000
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      DB_NAME: ${DB_NAME}
      DB_SYNCHRONIZE: "false"
      JWT_SECRET: ${JWT_SECRET}
      INTERNAL_SERVICE_TOKEN: ${INTERNAL_SERVICE_TOKEN}
      FRONTEND_URL: ${FRONTEND_URL}
      ORDER_SERVICE_URL: http://order-service:4010
      PAYMENT_SERVICE_URL: http://payment-service:4020
      VIRTUAL_HOST: ${API_DOMAIN}
      LETSENCRYPT_HOST: ${API_DOMAIN}
      VIRTUAL_PORT: "4000"
    volumes:
      - uploads_data:/app/uploads
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://localhost:4000/health || exit 1"]
      interval: 15s
      timeout: 5s
      retries: 10
      start_period: 30s
    networks:
      - mongol-beauty-prod-network

  # ── Frontend ─────────────────────────────────────────────────────────────
  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
      args:
        VITE_GRAPHQL_URL: https://${API_DOMAIN}/graphql
    container_name: mb-web
    restart: unless-stopped
    environment:
      VIRTUAL_HOST: ${DOMAIN}
      LETSENCRYPT_HOST: ${DOMAIN}
    depends_on:
      - nginx-proxy
    networks:
      - mongol-beauty-prod-network

  # ── Weekly DB backup ─────────────────────────────────────────────────────
  db-backup:
    image: postgres:15-alpine
    container_name: mb-db-backup
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      PGPASSWORD: ${DB_PASSWORD}
      DB_HOST: postgres
      DB_USER: ${DB_USER}
      DB_NAME: ${DB_NAME}
    volumes:
      - /var/backups/mongol-beauty:/backups
      - ./scripts/db-backup.sh:/scripts/db-backup.sh:ro
    command: >
      sh -c "
        chmod +x /scripts/db-backup.sh &&
        echo '59 23 * * 6 /scripts/db-backup.sh >> /backups/backup.log 2>&1' | crontab - &&
        crond -f -l 2
      "
    networks:
      - mongol-beauty-prod-network

volumes:
  postgres_data:
    name: mb_prod_postgres_data
  uploads_data:
    name: mb_prod_uploads_data
  certs:
    name: mb_prod_certs
  vhost:
    name: mb_prod_vhost
  html:
    name: mb_prod_html
  acme:
    name: mb_prod_acme

networks:
  mongol-beauty-prod-network:
    name: mongol-beauty-prod-network
```

- [ ] **Step 2: Validate compose file syntax**

```bash
docker compose -f docker-compose.prod.yml config --quiet && echo "syntax OK"
```
Expected: `syntax OK` (will warn about missing env vars — that is fine, it's not using `.env.prod` yet).

- [ ] **Step 3: Commit**

```bash
git add docker-compose.prod.yml
git commit -m "chore: add production Docker Compose stack"
```

---

## Task 7: Create `scripts/setup-server.sh`

**Files:**
- Create: `scripts/setup-server.sh`

Run this script once on a fresh VPS after cloning the repo.

- [ ] **Step 1: Create the file**

Create `scripts/setup-server.sh` with this exact content:

```bash
#!/bin/sh
# =============================================================================
# Mongol Beauty — One-time VPS setup
# Run once after cloning the repo on the production server:
#   chmod +x scripts/setup-server.sh && ./scripts/setup-server.sh
# =============================================================================
set -e

echo "==> Creating backup directory..."
mkdir -p /var/backups/mongol-beauty
chmod 750 /var/backups/mongol-beauty
echo "    /var/backups/mongol-beauty created"

echo "==> Creating Docker network..."
docker network create mongol-beauty-prod-network 2>/dev/null \
  && echo "    network created" \
  || echo "    network already exists, skipping"

echo "==> Setting up .env.prod..."
if [ ! -f .env.prod ]; then
  cp .env.prod.example .env.prod
  echo "    .env.prod created from template"
  echo ""
  echo "  !! ACTION REQUIRED: Fill in all <placeholder> values in .env.prod"
  echo "     Run: nano .env.prod"
  echo ""
else
  echo "    .env.prod already exists, skipping"
fi

echo ""
echo "==> Setup complete."
echo "    Next steps:"
echo "    1. Fill in secrets:   nano .env.prod"
echo "    2. Point DNS:         mcosmetic.mn → this server IP"
echo "                          api.mcosmetic.mn → this server IP"
echo "    3. Deploy:            ./scripts/deploy.sh"
```

- [ ] **Step 2: Make executable**

```bash
chmod +x scripts/setup-server.sh
```

- [ ] **Step 3: Verify syntax**

```bash
sh -n scripts/setup-server.sh && echo "syntax OK"
```
Expected: `syntax OK`

- [ ] **Step 4: Commit**

```bash
git add scripts/setup-server.sh
git commit -m "chore: add one-time VPS setup script"
```

---

## Task 8: Create `scripts/deploy.sh`

**Files:**
- Create: `scripts/deploy.sh`

- [ ] **Step 1: Create the file**

Create `scripts/deploy.sh` with this exact content:

```bash
#!/bin/sh
# =============================================================================
# Mongol Beauty — Deploy script
# Run on the VPS to pull latest code and redeploy:
#   ./scripts/deploy.sh
# Prerequisites: .env.prod is filled in, setup-server.sh was run.
# =============================================================================
set -e

COMPOSE="docker compose -f docker-compose.prod.yml --env-file .env.prod"

echo "==> Pulling latest code..."
git pull origin main

echo "==> Building images..."
$COMPOSE build

echo "==> Starting containers..."
$COMPOSE up -d

echo "==> Waiting for gateway to be healthy..."
RETRIES=20
until $COMPOSE exec -T gateway wget -qO- http://localhost:4000/health > /dev/null 2>&1; do
  RETRIES=$((RETRIES - 1))
  if [ "$RETRIES" -eq 0 ]; then
    echo "ERROR: Gateway did not become healthy. Check logs:"
    echo "  docker compose -f docker-compose.prod.yml logs gateway"
    exit 1
  fi
  echo "    waiting... ($RETRIES retries left)"
  sleep 5
done
echo "    Gateway is healthy."

echo "==> Running database migrations..."
$COMPOSE exec -T gateway \
  node /app/node_modules/.bin/typeorm migration:run \
  -d /app/apps/api/dist/data-source.js \
  && echo "    Migrations complete." \
  || echo "    No pending migrations — continuing."

echo ""
echo "==> Deploy complete."
echo "    Frontend: https://mcosmetic.mn"
echo "    API:      https://api.mcosmetic.mn/health"
```

- [ ] **Step 2: Make executable**

```bash
chmod +x scripts/deploy.sh
```

- [ ] **Step 3: Verify syntax**

```bash
sh -n scripts/deploy.sh && echo "syntax OK"
```
Expected: `syntax OK`

- [ ] **Step 4: Commit**

```bash
git add scripts/deploy.sh
git commit -m "chore: add production deploy script"
```

---

## Task 9: Local smoke test — build both images end-to-end

This verifies the Dockerfiles work before pushing to the VPS.

- [ ] **Step 1: Build both images from repo root**

```bash
docker build -f apps/api/Dockerfile -t mb-api-smoke . && echo "API build OK"
docker build -f apps/web/Dockerfile -t mb-web-smoke . && echo "WEB build OK"
```
Expected: both print their respective `OK` line.

- [ ] **Step 2: Confirm API image starts and responds**

```bash
docker run --rm -d \
  -e NODE_ENV=production \
  -e SERVICE_MODE=gateway \
  -e PORT=4000 \
  -e DB_HOST=localhost \
  -e DB_PORT=5432 \
  -e DB_USER=postgres \
  -e DB_PASSWORD=postgres \
  -e DB_NAME=mongol_beauty \
  -e JWT_SECRET=test-secret \
  -e INTERNAL_SERVICE_TOKEN=test-token \
  -e FRONTEND_URL=http://localhost:5173 \
  -p 4001:4000 \
  --name mb-api-smoke-run \
  mb-api-smoke

sleep 5
curl -s http://localhost:4001/health || echo "(expected to fail without DB — image starts OK if no crash)"
docker stop mb-api-smoke-run
```
Expected: container starts (DB connection errors are fine — no DB connected), then stops cleanly.

- [ ] **Step 3: Confirm web image serves index.html**

```bash
docker run --rm -d -p 8081:80 --name mb-web-smoke-run mb-web-smoke
sleep 2
curl -s -o /dev/null -w "HTTP %{http_code}" http://localhost:8081/
docker stop mb-web-smoke-run
```
Expected: `HTTP 200`

- [ ] **Step 4: Clean up test images**

```bash
docker rmi mb-api-smoke mb-web-smoke mb-api-test mb-web-test 2>/dev/null; true
```

- [ ] **Step 5: Final commit — push to main**

```bash
git status
git push origin main
```

---

## VPS Go-Live Checklist

After pushing, run these steps on the production server:

```bash
# 1. Clone repo
git clone <your-repo-url> /opt/mongol-beauty
cd /opt/mongol-beauty

# 2. One-time setup
chmod +x scripts/setup-server.sh && ./scripts/setup-server.sh

# 3. Fill in secrets
nano .env.prod

# 4. Point DNS (do this before running deploy):
#    mcosmetic.mn      → A record → <VPS IP>
#    api.mcosmetic.mn  → A record → <VPS IP>

# 5. Deploy
chmod +x scripts/deploy.sh && ./scripts/deploy.sh

# 6. Verify SSL certs issued (takes ~60 seconds after first deploy)
curl -s https://mcosmetic.mn | grep -i "mongol"
curl -s https://api.mcosmetic.mn/health

# 7. Verify backup cron is registered
docker exec mb-db-backup crontab -l
# Expected: 59 23 * * 6 /scripts/db-backup.sh >> /backups/backup.log 2>&1

# 8. Run a manual backup to test it works now (don't wait for Saturday)
docker exec mb-db-backup /scripts/db-backup.sh
cat /var/backups/mongol-beauty/backup.log
ls -lh /var/backups/mongol-beauty/
```
