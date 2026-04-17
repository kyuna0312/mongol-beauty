# Mongol Beauty — E-commerce Platform

A monorepo beauty e-commerce platform built for Mongolian Gen Z users, featuring an order-centric Taobao-style flow with manual payment verification.

**Live site**: https://mcosmetics.mn

---

## Architecture

### Monorepo Structure
```
mongol-beauty/
├── apps/
│   ├── web/          # React 18 + Vite frontend
│   └── api/          # NestJS GraphQL backend (gateway / order / payment modes)
├── packages/
│   ├── ui/           # Shared Tailwind UI components
│   ├── types/        # Shared TypeScript types & enums
│   └── config/       # Shared ESLint, TS, Tailwind configs
└── package.json      # Yarn workspaces root
```

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Apollo Client, Chakra UI
- **Backend**: NestJS, GraphQL (Apollo Server), TypeORM, PostgreSQL 15
- **Infra**: Docker Compose, nginx-proxy, Let's Encrypt (acme-companion)

---

## Local Development

### Prerequisites
- Node.js 20+, Yarn 1.22+
- Docker & Docker Compose

### Setup

```bash
# 1. Install dependencies
yarn install

# 2. Copy env files
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# 3. Start PostgreSQL
yarn docker:up

# 4. Start everything (backend + frontend)
yarn dev:full
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| GraphQL Playground | http://localhost:4000/graphql |
| Admin panel | http://localhost:5173/admin |

### Useful commands

```bash
yarn dev:api          # backend only (port 4000)
yarn dev:web          # frontend only (port 5173)
yarn docker:down      # stop database
yarn docker:clean     # wipe database volume
yarn seed             # seed demo data
yarn create-admin     # create admin user
```

### Database migrations (local)

```bash
# Generate migration from entity changes
npm run migration:generate -w @mongol-beauty/api -- src/migrations/DescribeChange

# Run pending migrations
yarn db:migrate
```

---

## Production Deployment

### Prerequisites
- VPS with Docker & Docker Compose installed
- Domain DNS pointing to server IP:
  ```
  mcosmetics.mn     → <server-ip>
  api.mcosmetics.mn → <server-ip>
  ```
- Ports **80** and **443** open on the firewall

### 1. Clone and configure

```bash
git clone https://github.com/kyuna0312/mongol-beauty.git
cd mongol-beauty

cp .env.prod.example .env.prod
```

Edit `.env.prod`:

```env
# Database
DB_USER=postgres
DB_PASSWORD=<strong-password>
DB_NAME=mongol_beauty

# App secrets (generate with: openssl rand -hex 32)
JWT_SECRET=<secret>
INTERNAL_SERVICE_TOKEN=<secret>

# Domains
DOMAIN=mcosmetics.mn
API_DOMAIN=api.mcosmetics.mn
FRONTEND_URL=https://mcosmetics.mn

# SSL
LETSENCRYPT_EMAIL=khatanzorigb@gmail.com

# Backups (must be a writable path)
BACKUP_DIR=/home/<user>/backups/mongol-beauty
```

### 2. Create backup directory

```bash
mkdir -p ~/backups/mongol-beauty
```

### 3. Deploy

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

**Startup order**:
1. `postgres` — waits until healthy
2. `migrator` — runs TypeORM migrations, exits 0
3. `order-service`, `payment-service`, `gateway` — start after migrations complete
4. `web` — frontend served via nginx
5. `nginx-proxy` + `acme-companion` — reverse proxy + auto SSL

### 4. Verify

```bash
# Check all containers are running
docker compose -f docker-compose.prod.yml ps

# Tail logs
docker compose -f docker-compose.prod.yml logs -f

# Single service logs
docker compose -f docker-compose.prod.yml logs -f gateway
docker compose -f docker-compose.prod.yml logs -f migrator
```

| URL | Service |
|-----|---------|
| https://mcosmetics.mn | Frontend |
| https://api.mcosmetics.mn/graphql | GraphQL API |
| https://api.mcosmetics.mn/health | Health check |

### Re-deploy after code changes

```bash
git pull
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

### Stop / tear down

```bash
# Stop (keep volumes)
docker compose -f docker-compose.prod.yml --env-file .env.prod down

# Stop and delete all data (destructive)
docker compose -f docker-compose.prod.yml --env-file .env.prod down -v
```

---

## Features

### User Flow
1. Browse products by category
2. Add to cart
3. Create order
4. Manual bank transfer payment
5. Upload payment receipt
6. Admin verifies and confirms
7. Order tracked: `WAITING_PAYMENT → PAID_CONFIRMED → SHIPPING → COMPLETED`

### Admin Panel (`/admin`)
- Order list with status filtering
- Payment receipt viewer
- Confirm payments, update status
- Product & category CRUD

---

## GraphQL API

### Key Queries
- `products(categoryId, limit, offset)` — list products
- `product(id)` — product detail
- `categories` — all categories
- `order(id)` — order detail
- `adminOrders` — admin: all orders

### Key Mutations
- `createOrder(input)` — place order
- `uploadPaymentReceipt(orderId, file)` — attach receipt
- `confirmPayment(orderId)` — admin: confirm
- `updateOrderStatus(orderId, status)` — admin: update status

---

## Code Quality

```bash
yarn type-check        # TypeScript check (all packages)
yarn lint              # ESLint (max-warnings=0)
yarn lint:fix          # Lint + auto-fix
yarn test              # All tests (Jest + Vitest)
yarn graphql:codegen   # Regenerate GraphQL types
yarn ci                # Full CI pipeline
```

---

## License

Private — Mongol Beauty LLC
