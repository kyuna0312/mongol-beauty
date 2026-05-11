# Mongol Beauty

E-commerce platform for Mongolian beauty products (INCELLDERM · Mongolia). Customers browse products, add to cart, place orders, and pay via bank transfer. Admins confirm payments and manage order status through a dedicated panel.

**Live site**: https://mcosmetics.mn

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Apollo Client |
| Backend | NestJS, GraphQL code-first (Apollo Server v5), TypeORM |
| Database | PostgreSQL 15 |
| Infra | Docker Compose, nginx-proxy, Let's Encrypt |
| Storage | Cloudflare R2 (payment receipts) |
| Monorepo | Yarn workspaces |

---

## Monorepo Layout

```
mongol-beauty/
├── apps/
│   ├── web/          # React + Vite frontend
│   └── api/          # NestJS backend (gateway / order / payment modes)
├── packages/
│   ├── ui/           # @mongol-beauty/ui — shared React components
│   ├── types/        # @mongol-beauty/types — shared TypeScript types
│   └── config/       # Shared ESLint / TS / Tailwind configs
└── package.json      # Yarn workspaces root
```

---

## Local Development

**Requirements**: Node.js 20+, Yarn 1.22+, Docker

```bash
# 1. Install dependencies
yarn install

# 2. Copy environment files
cp .env.example .env
cp apps/api/.env.example apps/api/.env

# 3. Start Postgres and run API + web with hot-reload
yarn docker:up && yarn dev:full
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| GraphQL | http://localhost:4000/graphql |
| Admin panel | http://localhost:5173/admin |

### Useful commands

```bash
yarn dev:api             # API only
yarn dev:web             # Frontend only
yarn seed                # Seed demo products and categories
yarn create-admin        # Create or reset admin account
yarn create-demo-user    # Create demo storefront user
yarn docker:clean        # Wipe database volume (fresh start)
```

### Demo accounts (after running seed scripts)

| Role | Login page | Email | Password |
|------|-----------|-------|----------|
| Admin | `/admin/login` | `admin@incellderm.mn` | `admin123` |
| Storefront user | `/login` | `demo@mongol-beauty.local` | `demo1234` |

### Full Docker stack (no Node.js required)

```bash
docker compose -f docker-compose.local.yml up --build -d
```

All services run inside Docker — no Node.js needed on the host. See [docs/DOCKER.md](docs/DOCKER.md) for details.

---

## Production Deployment

### 1. Server requirements

- VPS with Docker + Compose installed
- DNS A-record pointing to server IP
- Ports 80 and 443 open in the firewall

### 2. Configure environment

```bash
git clone https://github.com/kyuna0312/mongol-beauty.git
cd mongol-beauty
cp .env.prod.example .env.prod
# Fill in every value in .env.prod (see docs/PRODUCTION_OPS.md for reference)
```

### 3. First deploy

```bash
sudo docker compose -f docker-compose.prod.yml --env-file .env.prod up --build -d
```

Startup order: `postgres` → `migrator` (TypeORM migrations) → `order-service` + `payment-service` + `gateway` → `web` → `nginx-proxy` + TLS.

### 4. Create admin account

```bash
sudo docker exec mb-gateway node /app/apps/api/.dist/scripts/create-admin.js
```

Default credentials: `admin@incellderm.mn` / `admin123` — **change the password immediately**.

### 5. Seed demo data (optional)

```bash
sudo docker exec mb-gateway node /app/apps/api/.dist/scripts/seed.js
```

### 6. Deploy a code update

```bash
git pull
sudo docker compose -f docker-compose.prod.yml --env-file .env.prod build gateway
sudo docker compose -f docker-compose.prod.yml --env-file .env.prod up -d gateway
```

Full production runbook: [docs/PRODUCTION_OPS.md](docs/PRODUCTION_OPS.md)

---

## Order Flow

```
Browse → Add to cart → Create order (WAITING_PAYMENT)
  → Upload bank transfer receipt
    → Admin confirms payment (PAID_CONFIRMED)
      → Admin marks shipped (SHIPPING)
        → Admin marks complete (COMPLETED)
```

`PaymentMethod`: `BANK_TRANSFER` (receipt upload required) | `CASH`

---

## Admin Panel (`/admin`)

- Order list with status filter and receipt viewer
- Confirm payments, update order status
- Product and category CRUD (create, edit, delete, toggle visibility)
- Site settings (delivery fee, free delivery threshold, bank account info)
- User management with subscription tier control

Protected by JWT-based authentication — access requires an admin account.

---

## GraphQL API

```graphql
# Public queries
products(categoryId, limit, offset, search)
productsPaged(categoryId, limit, offset, search)
product(id)
categories
category(id)

# Auth required
me
order(id)
userOrders

# Admin only
adminProducts(...)
adminProductsPaged(...)
adminOrders(status, limit, offset)
adminOrderStats

# Mutations — public
register(input)
userLogin(input)
logout

# Mutations — auth required
createOrder(input)
uploadPaymentReceipt(orderId, file)
addToCart / removeFromCart / clearCart

# Mutations — admin only
createProduct(input) / updateProduct(input) / deleteProduct(id)
createCategory(input) / updateCategory(input) / deleteCategory(id)
confirmPayment(orderId)
updateOrderStatus(orderId, status)
updateUserSubscription(userId, userType)
updateSiteSettings(input)
```

---

## Code Quality

```bash
yarn type-check          # TypeScript across all packages
yarn lint                # ESLint, max-warnings=0
yarn lint:fix            # Lint + auto-fix
yarn test                # Jest (API) + Vitest (web)
yarn graphql:codegen     # Regenerate GraphQL types from schema
yarn graphql:codegen:check  # Verify no schema drift (run by CI)
yarn ci                  # Full CI pipeline: type-check + lint + test + codegen:check
```

Zero lint warnings are enforced — `yarn lint` must pass with `--max-warnings=0` before every commit (Husky pre-commit hook).

---

## Database Migrations

```bash
# Generate migration from entity changes
npm run migration:generate -w @mongol-beauty/api -- src/migrations/DescribeName

# Run pending migrations
yarn db:migrate
```

TypeORM `synchronize: true` is on in local development. It is disabled in production (`DB_SYNCHRONIZE=false`) — migrations must be used explicitly.

---

## Documentation

| Doc | Contents |
|-----|---------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Full system architecture, module breakdown, auth, DataLoader, service modes, pricing tiers |
| [docs/DOCKER.md](docs/DOCKER.md) | All three Compose files, Dockerfile overview, Cloudflare R2 setup, common issues |
| [docs/LOCAL_SETUP.md](docs/LOCAL_SETUP.md) | Step-by-step local environment setup |
| [docs/PRODUCTION_OPS.md](docs/PRODUCTION_OPS.md) | Deploy, rollback, logs, DB access, admin scripts, env variable reference |

---

## License

Private — Mongol Beauty LLC
