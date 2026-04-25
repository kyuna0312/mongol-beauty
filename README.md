# Mongol Beauty

E-commerce platform for Mongolian beauty products. Taobao-style order flow with manual bank transfer payment and receipt verification.

**Live**: https://mcosmetics.mn

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Apollo Client, Chakra UI |
| Backend | NestJS, GraphQL (Apollo Server), TypeORM, PostgreSQL 15 |
| Infra | Docker Compose, nginx-proxy, Let's Encrypt |
| Storage | Cloudflare R2 (receipts) |

## Monorepo Layout

```
mongol-beauty/
├── apps/
│   ├── web/          # React + Vite frontend
│   └── api/          # NestJS backend (gateway / order / payment modes)
├── packages/
│   ├── ui/           # Shared UI components
│   ├── types/        # Shared TypeScript types
│   └── config/       # Shared ESLint / TS / Tailwind configs
└── package.json      # Yarn workspaces root
```

---

## Local Development

**Requirements**: Node.js 20+, Yarn 1.22+, Docker

```bash
# Install dependencies
yarn install

# Copy env files
cp .env.example .env
cp apps/api/.env.example apps/api/.env

# Start Postgres + all services with hot-reload
yarn docker:up && yarn dev:full
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| GraphQL | http://localhost:4000/graphql |
| Admin | http://localhost:5173/admin |

### Common commands

```bash
yarn dev:api           # backend only
yarn dev:web           # frontend only
yarn seed              # seed demo products
yarn create-admin      # create admin account
yarn docker:clean      # wipe database volume
```

### Full Docker stack (no Node required)

```bash
docker compose -f docker-compose.local.yml up --build -d
```

All services run inside Docker. See [docs/DOCKER.md](docs/DOCKER.md) for details.

---

## Production Deployment

### 1. Server requirements

- VPS with Docker + Compose
- DNS A-record: `mcosmetics.mn` → server IP
- Ports 80 and 443 open

### 2. Configure

```bash
git clone https://github.com/kyuna0312/mongol-beauty.git
cd mongol-beauty
cp .env.prod.example .env.prod
# Fill in every value in .env.prod
```

### 3. Deploy

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

Startup order: `postgres` → `migrator` (runs TypeORM migrations) → `order-service` + `payment-service` + `gateway` → `web` → `nginx-proxy` + SSL.

### 4. Update

```bash
git pull
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

Full Docker guide, Cloudflare R2 setup, and troubleshooting: [docs/DOCKER.md](docs/DOCKER.md)

---

## Order Flow

```
Browse → Add to cart → Create order → Bank transfer → Upload receipt
→ Admin confirms → WAITING_PAYMENT → PAID_CONFIRMED → SHIPPING → COMPLETED
```

## Admin Panel (`/admin`)

- Order list with status filter
- Payment receipt viewer
- Confirm payments, update order status
- Product & category CRUD

---

## GraphQL API

```graphql
# Queries
products(categoryId, limit, offset)
product(id)
categories
order(id)
adminOrders

# Mutations
createOrder(input)
uploadPaymentReceipt(orderId, file)
confirmPayment(orderId)
updateOrderStatus(orderId, status)
```

---

## Code Quality

```bash
yarn type-check         # TypeScript (all packages)
yarn lint               # ESLint max-warnings=0
yarn lint:fix           # lint + auto-fix
yarn test               # Jest + Vitest
yarn graphql:codegen    # regenerate GraphQL types
yarn ci                 # full CI pipeline
```

---

## Database Migrations

```bash
# Generate from entity changes
npm run migration:generate -w @mongol-beauty/api -- src/migrations/DescribeName

# Run pending migrations
yarn db:migrate
```

---

## License

Private — Mongol Beauty LLC
