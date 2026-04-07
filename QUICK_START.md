# 🚀 Quick Start Guide

Get up and running in 5 minutes!

For a **full local stack runbook** (Docker, env, migrations, troubleshooting), see [docs/LOCAL_SETUP.md](./docs/LOCAL_SETUP.md).

## Prerequisites

- **Node.js** 18+ and **Yarn** 1.22+
- **Docker** & **Docker Compose**

**Don't have Docker?**
- **Fedora**: See [INSTALL_DOCKER_FEDORA.md](./INSTALL_DOCKER_FEDORA.md)
- **Other Linux**: https://docs.docker.com/engine/install/
- **macOS/Windows**: https://docs.docker.com/desktop/

## Step 1: Install Dependencies

```bash
yarn install
```

## Step 2: Set Up Environment

```bash
# Copy example files
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Or use the automated setup:
```bash
yarn setup
```

## Step 3: Start Database

```bash
yarn docker:up
```

Wait a few seconds for PostgreSQL to initialize.

## Step 4: Start Development Servers

```bash
yarn dev
```

This starts:
- ✅ Backend API on http://localhost:4000
- ✅ Frontend on http://localhost:5173

## Step 5: Verify

1. **GraphQL Playground**: http://localhost:4000/graphql
2. **Web App**: http://localhost:5173

## 🎉 You're Ready!

Start coding! The servers will auto-reload on file changes.

---

### Common Commands

```bash
# Stop everything
Ctrl+C (in terminal)

# Stop database
yarn docker:down

# View database logs
yarn docker:logs

# Check environment files
yarn check-env
```

### Troubleshooting

**Database won't start?**
```bash
yarn docker:logs
```

**Port already in use?**
- Change `PORT` in `apps/api/.env`
- Change `DB_PORT` in `.env` and `docker-compose.yml`

**Need help?** See [docs/LOCAL_SETUP.md](./docs/LOCAL_SETUP.md) for the full guide.
