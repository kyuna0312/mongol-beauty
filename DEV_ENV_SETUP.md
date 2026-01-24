# Development Environment Setup - Complete

## ✅ What's Been Configured

### 1. Docker Compose ✅
- **File**: `docker-compose.yml`
- PostgreSQL 15 Alpine image
- Named volume for data persistence
- Health checks configured
- Environment variable support

### 2. Environment Files ✅
- **Root**: `.env.example` (for Docker)
- **Backend**: `apps/api/.env.example`
- **Frontend**: `apps/web/.env.example`

### 3. Backend Configuration ✅
- TypeORM configured with async factory pattern
- Auto-retry on connection failure
- Auto-load entities
- Environment variable loading via ConfigModule

### 4. Frontend Configuration ✅
- Apollo Client uses `VITE_GRAPHQL_URL` from env
- Vite proxy configured for development

### 5. Scripts & Commands ✅
- `yarn docker:up` - Start database
- `yarn docker:down` - Stop database
- `yarn docker:logs` - View logs
- `yarn docker:restart` - Restart database
- `yarn docker:clean` - Remove all data
- `yarn dev` - Start API + Frontend
- `yarn dev:api` - Backend only
- `yarn dev:web` - Frontend only
- `yarn dev:full` - DB + API + Frontend
- `yarn check-env` - Verify env files
- `yarn setup` - Automated setup

### 6. Documentation ✅
- `QUICK_START.md` - 5-minute setup guide
- `DEVELOPMENT.md` - Complete development guide
- `DEV_ENV_SETUP.md` - This file (summary)

### 7. Helper Scripts ✅
- `scripts/wait-for-db.js` - Wait for DB to be ready
- `scripts/check-env.js` - Verify environment files
- `scripts/verify-setup.sh` - Complete environment check

## 🚀 Quick Start

```bash
# 1. Install dependencies
yarn install

# 2. Set up environment (copy example files)
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# 3. Start database
yarn docker:up

# 4. Start development servers
yarn dev
```

## 📝 Step-by-Step Verification

### Step 1: Verify Prerequisites
```bash
./scripts/verify-setup.sh
```

### Step 2: Check Environment Files
```bash
yarn check-env
```

### Step 3: Start Database
```bash
yarn docker:up
yarn docker:logs  # Verify it's running
```

### Step 4: Start Backend
```bash
yarn dev:api
# Should see: "GraphQL API running on http://localhost:4000/graphql"
```

### Step 5: Verify GraphQL
- Open: http://localhost:4000/graphql
- Should see GraphQL Playground

### Step 6: Start Frontend
```bash
yarn dev:web
# Should see: "Local: http://localhost:5173"
```

### Step 7: Verify Frontend
- Open: http://localhost:5173
- Should load without errors

## 🔧 Configuration Details

### Database Connection
- **Host**: localhost (or from .env)
- **Port**: 5432 (or from .env)
- **Database**: mongol_beauty
- **User**: postgres
- **Password**: postgres

### Backend API
- **Port**: 4000
- **GraphQL**: http://localhost:4000/graphql
- **Auto-sync**: Enabled in development (TypeORM)

### Frontend
- **Port**: 5173
- **GraphQL URL**: http://localhost:4000/graphql
- **Hot Reload**: Enabled

## 🐛 Common Issues & Solutions

### Issue: "Cannot connect to database"
**Solution**:
1. Check Docker is running: `docker ps`
2. Start database: `yarn docker:up`
3. Wait 5-10 seconds for initialization
4. Check logs: `yarn docker:logs`

### Issue: "Port already in use"
**Solution**:
1. Change port in `.env` files
2. Update `docker-compose.yml` if changing DB port
3. Restart services

### Issue: "Environment variables not loading"
**Solution**:
1. Verify `.env` files exist (not just `.env.example`)
2. Check file locations match ConfigModule paths
3. Restart the server

### Issue: "TypeORM synchronize errors"
**Solution**:
1. Reset database: `yarn docker:clean && yarn docker:up`
2. Restart backend

## 📚 Next Steps

1. **Read**: [QUICK_START.md](./QUICK_START.md) for quick setup
2. **Read**: [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed guide
3. **Start coding**: Make changes and see them hot-reload!

## 🎯 Production Notes

⚠️ **Before deploying to production**:

1. **Disable synchronize**: Set `synchronize: false` in TypeORM config
2. **Use migrations**: Create and run TypeORM migrations
3. **Change passwords**: Update all default passwords
4. **Set NODE_ENV**: `NODE_ENV=production`
5. **Remove playground**: Disable GraphQL Playground
6. **Use environment secrets**: Don't hardcode credentials

---

**Everything is ready! Start developing! 🚀**
