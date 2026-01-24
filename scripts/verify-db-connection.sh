#!/bin/bash

# Script to verify database connection and credentials

echo "🔍 Verifying Database Connection..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Load environment variables
if [ -f "apps/api/.env" ]; then
  export $(cat apps/api/.env | grep -v '^#' | xargs)
  echo "✅ Loaded environment from apps/api/.env"
else
  echo -e "${RED}❌${NC} apps/api/.env not found"
  exit 1
fi

echo ""
echo "📋 Database Configuration:"
echo "  Host: ${DB_HOST:-localhost}"
echo "  Port: ${DB_PORT:-5432}"
echo "  User: ${DB_USER:-postgres}"
echo "  Database: ${DB_NAME:-mongol_beauty}"
echo "  Password: ${DB_PASSWORD:+***set***}${DB_PASSWORD:-not set}"
echo ""

# Check if Docker container is running
echo "🐳 Checking Docker container..."
if docker ps --format '{{.Names}}' 2>/dev/null | grep -q "mongol-beauty-db"; then
  if docker ps --format '{{.Names}} {{.Status}}' 2>/dev/null | grep -q "mongol-beauty-db.*Up"; then
    echo -e "  ${GREEN}✅${NC} Container is running"
    
    # Get container environment
    echo ""
    echo "📦 Container Environment:"
    docker inspect mongol-beauty-db 2>/dev/null | grep -A 10 '"Env"' | grep POSTGRES | sed 's/^/  /' || echo "  Could not read container env"
  else
    echo -e "  ${YELLOW}⚠️${NC}  Container exists but not running"
    echo "  Start with: yarn docker:up"
  fi
else
  echo -e "  ${RED}❌${NC} Container not found"
  echo "  Start with: yarn docker:up"
fi

echo ""
echo "🔌 Testing Connection..."

# Try to connect using psql if available
if command -v psql &> /dev/null; then
  export PGPASSWORD="${DB_PASSWORD}"
  if psql -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "${DB_USER:-postgres}" -d "${DB_NAME:-mongol_beauty}" -c "SELECT 1;" &>/dev/null; then
    echo -e "  ${GREEN}✅${NC} Connection successful!"
  else
    echo -e "  ${RED}❌${NC} Connection failed"
    echo "  Error details:"
    psql -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "${DB_USER:-postgres}" -d "${DB_NAME:-mongol_beauty}" -c "SELECT 1;" 2>&1 | sed 's/^/    /'
  fi
  unset PGPASSWORD
else
  echo "  ⚠️  psql not available, skipping connection test"
  echo "  Install with: sudo dnf install postgresql15"
fi

echo ""
echo "💡 Troubleshooting Tips:"
echo "  1. Ensure Docker container is running: yarn docker:up"
echo "  2. Check credentials match between .env and docker-compose.yml"
echo "  3. If container was created with different credentials, recreate it:"
echo "     yarn docker:clean && yarn docker:up"
echo "  4. Verify .env file is in apps/api/.env"
