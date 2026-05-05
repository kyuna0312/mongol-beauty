# Production Operations

Server: `103.168.178.174`, SSH port `1314`  
Domain: `https://mcosmetics.mn`  
Project root on server: `/home/khatnaa/project/mongol-beauty`

---

## Deploy a Code Change

```bash
# 1. On your local machine — push to main
git push origin main

# 2. SSH into the server
ssh -p 1314 khatnaa@103.168.178.174

# 3. Pull latest code (owned by root, so use sudo)
sudo git -C /home/khatnaa/project/mongol-beauty pull

# 4. Rebuild and restart only the changed service
cd /home/khatnaa/project/mongol-beauty
sudo docker compose -f docker-compose.prod.yml --env-file .env.prod build gateway
sudo docker compose -f docker-compose.prod.yml --env-file .env.prod up -d gateway
```

For frontend-only changes replace `gateway` with `web`. For full redeploy, omit the service name.

---

## Check Container Status

```bash
sudo docker ps
sudo docker compose -f docker-compose.prod.yml ps
```

Expected healthy containers:

| Container | Image |
|-----------|-------|
| mb-nginx-proxy | nginxproxy/nginx-proxy |
| mb-acme | nginxproxy/acme-companion |
| mb-postgres | postgres:15-alpine |
| mb-gateway | mongol-beauty-prod-gateway |
| mb-order-service | mongol-beauty-prod-gateway |
| mb-payment-service | mongol-beauty-prod-gateway |
| mb-web | mongol-beauty-prod-web |
| mb-db-backup | (backup job) |

---

## View Logs

```bash
# Gateway (GraphQL API)
sudo docker logs mb-gateway --tail 100 -f

# Nginx proxy
sudo docker logs mb-nginx-proxy --tail 50

# Database
sudo docker logs mb-postgres --tail 50

# All services
sudo docker compose -f docker-compose.prod.yml logs -f
```

---

## Database Access

```bash
# Open psql shell inside the postgres container
sudo docker exec -it mb-postgres psql -U mongol_beauty_prod -d mongol_beauty

# Quick one-liner query
sudo docker exec mb-postgres psql -U mongol_beauty_prod -d mongol_beauty \
  -c "SELECT id, email, \"isAdmin\", \"userType\" FROM users;"
```

---

## Create / Reset Admin Account

The `create-admin` script is compiled into the gateway image. Run it inside the container:

```bash
sudo docker exec mb-gateway node /app/apps/api/.dist/scripts/create-admin.js
```

Default credentials when no env vars are set:

| Field | Value |
|-------|-------|
| Email | `admin@incellderm.mn` |
| Password | `admin123` |
| Name | `Админ` |

To override, set env vars before running:

```bash
sudo docker exec -e ADMIN_EMAIL=you@example.com \
  -e ADMIN_PASSWORD=strongpassword \
  mb-gateway node /app/apps/api/.dist/scripts/create-admin.js
```

If the admin already exists, the script **updates the password** rather than failing.

**Change the password immediately after first deploy.**

---

## Seed Products and Categories

```bash
sudo docker exec mb-gateway node /app/apps/api/.dist/scripts/seed.js
```

This is idempotent — safe to run multiple times.

---

## Create Demo User

```bash
sudo docker exec mb-gateway node /app/apps/api/.dist/scripts/create-demo-user.js
```

Default demo user: `demo@mongol-beauty.local` / `demo1234`

---

## Run Database Migrations Manually

Migrations run automatically via the `mb-migrator` container on every `docker compose up`. To run manually:

```bash
sudo docker exec mb-gateway node /app/apps/api/.dist/data-source.js
# or trigger migrator directly
sudo docker compose -f docker-compose.prod.yml --env-file .env.prod \
  run --rm migrator
```

---

## Restart a Single Service

```bash
sudo docker restart mb-gateway
sudo docker restart mb-web
sudo docker restart mb-nginx-proxy
```

---

## Update SSL Certificates

Let's Encrypt renewal is handled automatically by the `mb-acme` container. To force renew:

```bash
sudo docker exec mb-acme /app/force_renew
```

---

## Backup and Restore

Automated daily backups via `mb-db-backup` are stored at the `BACKUP_DIR` path configured in `.env.prod` (default: `/home/ubuntu/backups/mongol-beauty`).

Manual backup:

```bash
sudo docker exec mb-postgres pg_dump -U mongol_beauty_prod mongol_beauty \
  > backup-$(date +%Y%m%d).sql
```

Restore from backup:

```bash
sudo docker exec -i mb-postgres psql -U mongol_beauty_prod mongol_beauty \
  < backup-20260505.sql
```

---

## Common Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| Homepage shows "Мэдээлэл ачаалахад алдаа гарлаа" | GraphQL query error (non-nullable null, or DB issue) | Check `sudo docker logs mb-gateway --tail 50` for the specific error |
| "Invalid email or password" for all users | `users` table is empty (DB reset or fresh deploy) | Run `create-admin` script (see above) |
| `git pull` gives permission denied | `.git` owned by root | Use `sudo git -C /path pull` |
| `docker compose build` env var warnings | `.env.prod` not passed | Always include `--env-file .env.prod` |
| Receipt upload fails | Missing `CF_R2_*` env vars or wrong bucket | Check `.env.prod` R2 values and bucket public access |
| `mb-web` container exits immediately | Gateway not healthy yet | Wait for `mb-gateway` to be healthy, then `sudo docker start mb-web` |
| Port 80/443 not responding | `mb-nginx-proxy` not running | `sudo docker start mb-nginx-proxy` |
| GraphQL returns null for entire query | Non-nullable field resolver returning null | Check resolver code — all `@Field()` (no `nullable: true`) must never return null |

---

## Environment Variables Reference (`.env.prod`)

```bash
# Domain
DOMAIN=mcosmetics.mn
FRONTEND_URL=https://mcosmetics.mn
LETSENCRYPT_EMAIL=your@email.com

# Database
DB_USER=mongol_beauty_prod
DB_PASSWORD=<strong-random-password>
DB_NAME=mongol_beauty
DB_HOST=postgres          # Docker service name — do not change
DB_PORT=5432

# Secrets (generate: openssl rand -hex 32)
JWT_SECRET=<64-char-hex>
INTERNAL_SERVICE_SECRET=<64-char-hex>

# Cloudflare R2 (for payment receipt storage)
RECEIPT_STORAGE_DRIVER=r2
CF_R2_ACCOUNT_ID=<from Cloudflare Dashboard>
CF_R2_ACCESS_KEY_ID=<R2 token key>
CF_R2_SECRET_ACCESS_KEY=<R2 token secret>
CF_R2_BUCKET=mongol-beauty-receipts
CF_R2_PUBLIC_URL=https://pub-xxx.r2.dev

# Admin account (used by create-admin script)
ADMIN_EMAIL=admin@incellderm.mn
ADMIN_PASSWORD=<strong-password>
ADMIN_NAME=Админ

# Backup directory on host
BACKUP_DIR=/home/khatnaa/backups/mongol-beauty

# Node
NODE_ENV=production
DB_SYNCHRONIZE=false
```
