# Quick Start

Get up and running in minutes. For a full local stack runbook (Docker, env, migrations, troubleshooting), see [docs/LOCAL_SETUP.md](./docs/LOCAL_SETUP.md).

## Prerequisites

- Node.js 20+ and Yarn 1.22+
- Docker and Docker Compose

**Don't have Docker?**
- Linux: https://docs.docker.com/engine/install/
- macOS/Windows: https://docs.docker.com/desktop/

## Steps

### 1. Install dependencies

```bash
yarn install
```

### 2. Set up environment

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
```

Or use the automated setup:

```bash
yarn setup
```

### 3. Start the database

```bash
yarn docker:up
```

Wait a few seconds for PostgreSQL to initialize.

### 4. Start development servers

```bash
yarn dev:full
```

This starts:
- Backend API at http://localhost:4000
- Frontend at http://localhost:5173

### 5. Verify

- GraphQL endpoint: http://localhost:4000/graphql
- Web app: http://localhost:5173

---

## Common Commands

```bash
# Stop the database
yarn docker:down

# View database logs
yarn docker:logs

# Check environment files
yarn check-env

# Seed demo data and create demo accounts
yarn seed
yarn create-admin
yarn create-demo-user
```

## Troubleshooting

**Database won't start?**
```bash
yarn docker:logs
```

**Port already in use?**
- Change `PORT` in `apps/api/.env`
- Change `DB_PORT` in `.env` and `docker-compose.yml`

See [docs/LOCAL_SETUP.md](./docs/LOCAL_SETUP.md) for the full guide.
