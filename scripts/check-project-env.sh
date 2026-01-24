#!/bin/bash

# Comprehensive environment check for mongol-beauty project

echo "🔍 Checking Mongol Beauty Project Environment..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check environment files
echo "📁 Environment Files:"
ENV_FILES=(
  ".env:Root"
  "apps/api/.env:Backend API"
  "apps/web/.env:Frontend Web"
)

for file_info in "${ENV_FILES[@]}"; do
  IFS=':' read -r file_path file_name <<< "$file_info"
  if [ -f "$file_path" ]; then
    echo -e "  ${GREEN}✅${NC} $file_name: $file_path"
    # Show key values (first few lines)
    echo "     Values:"
    head -3 "$file_path" | sed 's/^/       /' | grep -v "^#" | head -2
  else
    echo -e "  ${RED}❌${NC} $file_name: $file_path (missing)"
  fi
done

echo ""
echo "🗄️  Database Configuration:"
if [ -f "apps/api/.env" ]; then
  source apps/api/.env 2>/dev/null || true
  echo "  Host: ${DB_HOST:-not set}"
  echo "  Port: ${DB_PORT:-not set}"
  echo "  Database: ${DB_NAME:-not set}"
  echo "  User: ${DB_USER:-not set}"
else
  echo "  ⚠️  Backend .env not found"
fi

echo ""
echo "🌐 API Configuration:"
if [ -f "apps/api/.env" ]; then
  source apps/api/.env 2>/dev/null || true
  echo "  Port: ${PORT:-4000 (default)}"
  echo "  NODE_ENV: ${NODE_ENV:-not set}"
  echo "  Frontend URL: ${FRONTEND_URL:-not set}"
fi

echo ""
echo "💻 Frontend Configuration:"
if [ -f "apps/web/.env" ]; then
  source apps/web/.env 2>/dev/null || true
  echo "  GraphQL URL: ${VITE_GRAPHQL_URL:-not set}"
fi

echo ""
echo "🐳 Docker Status:"
if docker ps --format '{{.Names}}' | grep -q "mongol-beauty-db"; then
  if docker ps --format '{{.Names}} {{.Status}}' | grep -q "mongol-beauty-db.*Up"; then
    echo -e "  ${GREEN}✅${NC} PostgreSQL container is running"
    # Get port mapping
    PORT_MAP=$(docker port mongol-beauty-db 2>/dev/null | head -1)
    echo "  Port: $PORT_MAP"
  else
    echo -e "  ${YELLOW}⚠️${NC}  Container exists but not running"
  fi
else
  echo -e "  ${RED}❌${NC} PostgreSQL container not running"
  echo "     Run: yarn docker:up"
fi

echo ""
echo "📦 Dependencies:"
if [ -d "node_modules" ]; then
  echo -e "  ${GREEN}✅${NC} Root node_modules exists"
else
  echo -e "  ${RED}❌${NC} Root node_modules missing - run: yarn install"
fi

if [ -d "apps/api/node_modules" ] || [ -d "node_modules/@mongol-beauty" ]; then
  echo -e "  ${GREEN}✅${NC} API dependencies available"
else
  echo -e "  ${YELLOW}⚠️${NC}  API dependencies may be missing"
fi

echo ""
echo "✅ Environment check complete!"
