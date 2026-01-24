# Development Environment Setup

Complete guide to setting up and running the Mongol Beauty monorepo locally.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Yarn** 1.22+ ([Install Guide](https://classic.yarnpkg.com/en/docs/install))
- **Docker** & **Docker Compose** ([Install Guide](https://docs.docker.com/get-docker/))
- **PostgreSQL Client** (optional, for direct DB access)

Verify installations:
```bash
node --version    # Should be v18+
yarn --version    # Should be 1.22+
docker --version  # Should be 20.10+
docker-compose --version  # Should be 1.29+
```

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone the repository (if not already done)
cd mongol-beauty

# Install all dependencies
yarn install
```

### 2. Set Up Environment Variables

```bash
# Copy example env files
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

**Important**: Edit `.env` files if you need to change default values:
- Database credentials
- Port numbers
- API URLs

### 3. Start Database

```bash
# Start PostgreSQL in Docker
yarn docker:up

# Verify it's running
docker ps
# You should see 'mongol-beauty-db' container
```

### 4. Start Development Servers

**Option A: Start everything together**
```bash
yarn dev:full
# This starts DB, waits, then starts API + frontend
```

**Option B: Start separately (recommended for debugging)**
```bash
# Terminal 1: Database (if not already running)
yarn docker:up

# Terminal 2: Backend API
yarn dev:api

# Terminal 3: Frontend
yarn dev:web
```

### 5. Verify Everything Works

1. **Database**: Check logs
   ```bash
   yarn docker:logs
   # Should see "database system is ready to accept connections"
   ```

2. **Backend API**: Open in browser
   - GraphQL Playground: http://localhost:4000/graphql
   - You should see the GraphQL schema explorer

3. **Frontend**: Open in browser
   - Web App: http://localhost:5173
   - Should load without errors

## 📁 Project Structure

```
mongol-beauty/
├── apps/
│   ├── api/          # NestJS GraphQL Backend
│   │   └── .env      # Backend environment variables
│   └── web/          # React + Vite Frontend
│       └── .env      # Frontend environment variables
├── packages/         # Shared packages
├── docker-compose.yml
├── .env              # Root environment (for Docker)
└── package.json      # Root workspace config
```

## 🛠️ Available Commands

### Docker Commands

```bash
# Start PostgreSQL container
yarn docker:up

# Stop PostgreSQL container
yarn docker:down

# View database logs
yarn docker:logs

# Restart database
yarn docker:restart

# Remove database and all data (⚠️ destructive)
yarn docker:clean
```

### Development Commands

```bash
# Start backend only
yarn dev:api

# Start frontend only
yarn dev:web

# Start both (API + Frontend)
yarn dev

# Start everything (DB + API + Frontend)
yarn dev:full
```

### Build Commands

```bash
# Build all packages
yarn build

# Type check all packages
yarn type-check
```

## 🔧 Configuration

### Database Configuration

The database is configured via environment variables in `apps/api/.env`:

```env
DB_HOST=localhost      # Docker service name or localhost
DB_PORT=5432          # PostgreSQL port
DB_USER=postgres   # Database user
DB_PASSWORD=postgres  # Database password
DB_NAME=mongol_beauty  # Database name
```

**Note**: TypeORM will automatically create tables on first run (synchronize: true in dev mode).

### Backend Configuration

Backend settings in `apps/api/.env`:

```env
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:5173
```

### Frontend Configuration

Frontend settings in `apps/web/.env`:

```env
VITE_GRAPHQL_URL=http://localhost:4000/graphql
```

## 🗄️ Database Management

### Access Database Directly

```bash
# Using Docker exec
docker exec -it mongol-beauty-db psql -U postgres -d mongol_beauty

# Using local psql (if installed)
psql -h localhost -U postgres -d mongol_beauty
```

### Common Database Operations

```sql
-- List all tables
\dt

-- Describe a table
\d products

-- View all products
SELECT * FROM products;

-- Reset database (⚠️ deletes all data)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

### Database Migrations

TypeORM uses `synchronize: true` in development, which auto-creates/updates tables.

**For production**, disable synchronize and use migrations:
```typescript
// In app.module.ts
synchronize: false,
migrations: ['dist/migrations/*.js'],
```

## 🐛 Troubleshooting

### Database Connection Issues

**Problem**: `ECONNREFUSED` or `Connection refused`

**Solutions**:
1. Check Docker is running:
   ```bash
   docker ps
   ```

2. Start the database:
   ```bash
   yarn docker:up
   ```

3. Check database logs:
   ```bash
   yarn docker:logs
   ```

4. Verify environment variables in `apps/api/.env` match `docker-compose.yml`

5. Wait a few seconds after starting Docker (database needs time to initialize)

### Port Already in Use

**Problem**: `Port 4000 is already in use` or `Port 5432 is already in use`

**Solutions**:
1. Find what's using the port:
   ```bash
   # macOS/Linux
   lsof -i :4000
   lsof -i :5432
   
   # Linux alternative
   netstat -tulpn | grep :4000
   ```

2. Change port in `.env` files:
   ```env
   # apps/api/.env
   PORT=4001
   
   # docker-compose.yml or .env
   DB_PORT=5433
   ```

3. Update frontend to match:
   ```env
   # apps/web/.env
   VITE_GRAPHQL_URL=http://localhost:4001/graphql
   ```

### TypeORM Synchronize Errors

**Problem**: `relation already exists` or schema errors

**Solutions**:
1. Reset database:
   ```bash
   yarn docker:clean
   yarn docker:up
   ```

2. Or manually drop and recreate:
   ```bash
   docker exec -it mongol-beauty-db psql -U postgres -d mongol_beauty -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
   ```

### GraphQL Playground Not Loading

**Problem**: Can't access http://localhost:4000/graphql

**Solutions**:
1. Check backend is running:
   ```bash
   # Should see "GraphQL API running on http://localhost:4000/graphql"
   yarn dev:api
   ```

2. Check CORS settings in `apps/api/src/main.ts`

3. Verify port 4000 is not blocked by firewall

### Frontend Can't Connect to API

**Problem**: `Failed to fetch` or network errors

**Solutions**:
1. Verify backend is running on port 4000

2. Check `VITE_GRAPHQL_URL` in `apps/web/.env`

3. Check browser console for CORS errors

4. Try accessing GraphQL Playground directly

### Docker Issues

**Problem**: `Cannot connect to Docker daemon`

**Solutions**:
1. Start Docker Desktop (macOS/Windows)

2. Check Docker service:
   ```bash
   # Linux
   sudo systemctl start docker
   ```

3. Verify Docker is running:
   ```bash
   docker ps
   ```

**Problem**: `Container name already in use`

**Solutions**:
```bash
# Remove existing container
docker rm -f mongol-beauty-db

# Start fresh
yarn docker:up
```

## 📝 Development Workflow

### Typical Development Session

1. **Start the day**:
   ```bash
   yarn docker:up      # Start database
   yarn dev            # Start API + Frontend
   ```

2. **Make changes**:
   - Backend: Auto-reloads on save
   - Frontend: Hot Module Replacement (HMR)
   - Database: TypeORM auto-syncs schema changes

3. **End the day**:
   ```bash
   # Stop servers (Ctrl+C)
   yarn docker:down    # Stop database (optional)
   ```

### Adding New Features

1. **Backend (GraphQL)**:
   - Add entity in `apps/api/src/[module]/[module].entity.ts`
   - Add service, resolver, module
   - TypeORM will auto-create table on restart

2. **Frontend**:
   - Add GraphQL query/mutation in `apps/web/src/graphql/`
   - Create page/component
   - Test in browser

### Database Changes

When you modify entities:
1. Stop the backend
2. Reset database (if needed): `yarn docker:clean && yarn docker:up`
3. Restart backend - TypeORM will recreate tables

## 🔒 Security Notes

⚠️ **Important for Production**:

1. **Never commit `.env` files** - They're in `.gitignore`
2. **Change default passwords** - Update `DB_PASSWORD` in production
3. **Disable synchronize** - Use migrations in production
4. **Set `NODE_ENV=production`** - Enables production optimizations
5. **Use strong passwords** - For database and API keys

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Apollo GraphQL](https://www.apollographql.com/docs/)
- [Vite Documentation](https://vitejs.dev/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

## 🆘 Getting Help

If you encounter issues:

1. Check this troubleshooting section
2. Review error logs:
   - Backend: Terminal output
   - Database: `yarn docker:logs`
   - Frontend: Browser console
3. Verify all prerequisites are installed
4. Check environment variables match examples

---

**Happy Coding! 🚀**
