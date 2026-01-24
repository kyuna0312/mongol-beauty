# Quick Setup Guide

## 1. Install Dependencies

```bash
yarn install
```

## 2. Database Setup

```bash
# Create PostgreSQL database
createdb mongol_beauty

# Or using psql
psql -U postgres -c "CREATE DATABASE mongol_beauty;"
```

## 3. Environment Configuration

### Backend (`apps/api/.env`)
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=mongol_beauty
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend (`apps/web/.env`)
```env
VITE_GRAPHQL_URL=http://localhost:4000/graphql
```

## 4. Run Development

```bash
# Run both frontend and backend
yarn dev

# Or separately:
yarn dev:api   # Backend on :4000
yarn dev:web   # Frontend on :5173
```

## 5. Access

- **Frontend**: http://localhost:5173
- **GraphQL Playground**: http://localhost:4000/graphql

## 6. First Steps

1. Open GraphQL Playground
2. Create a category:
```graphql
mutation {
  # Note: Categories are created via database seed or admin panel
}
```

3. Create products (via database or admin)
4. Start shopping!

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check credentials in `apps/api/.env`
- Verify database exists: `psql -U postgres -l`

### Port Already in Use
- Change `PORT` in `apps/api/.env`
- Update `VITE_GRAPHQL_URL` in `apps/web/.env` accordingly

### TypeScript Errors
- Run `yarn type-check` to see all errors
- Ensure all dependencies are installed: `yarn install`
