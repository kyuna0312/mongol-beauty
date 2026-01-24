#!/bin/bash

# Verify Development Environment Setup
# Usage: ./scripts/verify-setup.sh

set -e

echo "🔍 Verifying development environment setup..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo -n "Checking Node.js... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} $NODE_VERSION"
else
    echo -e "${RED}✗ Not found${NC}"
    exit 1
fi

# Check Yarn
echo -n "Checking Yarn... "
if command -v yarn &> /dev/null; then
    YARN_VERSION=$(yarn --version)
    echo -e "${GREEN}✓${NC} $YARN_VERSION"
else
    echo -e "${RED}✗ Not found${NC}"
    exit 1
fi

# Check Docker
echo -n "Checking Docker... "
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | cut -d',' -f1)
    echo -e "${GREEN}✓${NC} $DOCKER_VERSION"
else
    echo -e "${RED}✗ Not found${NC}"
    exit 1
fi

# Check Docker Compose
echo -n "Checking Docker Compose... "
if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
    echo -e "${GREEN}✓${NC} Installed"
else
    echo -e "${RED}✗ Not found${NC}"
    exit 1
fi

# Check environment files
echo ""
echo "Checking environment files..."

ENV_FILES=(".env" "apps/api/.env" "apps/web/.env")
ALL_ENV_EXIST=true

for file in "${ENV_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}✓${NC} $file"
    else
        echo -e "  ${RED}✗${NC} $file (missing)"
        ALL_ENV_EXIST=false
    fi
done

if [ "$ALL_ENV_EXIST" = false ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Some .env files are missing.${NC}"
    echo "   Run: cp .env.example .env && cp apps/api/.env.example apps/api/.env && cp apps/web/.env.example apps/web/.env"
fi

# Check Docker container
echo ""
echo -n "Checking PostgreSQL container... "
if docker ps --format '{{.Names}}' | grep -q "mongol-beauty-db"; then
    if docker ps --format '{{.Names}} {{.Status}}' | grep -q "mongol-beauty-db.*Up"; then
        echo -e "${GREEN}✓${NC} Running"
    else
        echo -e "${YELLOW}⚠${NC}  Container exists but not running"
        echo "   Run: yarn docker:up"
    fi
else
    echo -e "${YELLOW}⚠${NC}  Not running"
    echo "   Run: yarn docker:up"
fi

# Check ports
echo ""
echo "Checking ports..."

check_port() {
    local port=$1
    local service=$2
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 || netstat -tuln 2>/dev/null | grep -q ":$port "; then
        echo -e "  ${YELLOW}⚠${NC}  Port $port is in use ($service)"
    else
        echo -e "  ${GREEN}✓${NC} Port $port is available"
    fi
}

check_port 4000 "Backend API"
check_port 5173 "Frontend"
check_port 5432 "PostgreSQL"

echo ""
echo -e "${GREEN}✅ Verification complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. yarn docker:up    # Start database"
echo "  2. yarn dev         # Start development servers"
