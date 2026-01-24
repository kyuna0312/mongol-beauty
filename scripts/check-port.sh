#!/bin/bash

# Check what's using port 5432
# Usage: bash scripts/check-port.sh

PORT=${1:-5432}

echo "🔍 Checking what's using port $PORT..."
echo ""

# Try different methods to find what's using the port
if command -v lsof &> /dev/null; then
    echo "Using lsof:"
    sudo lsof -i :$PORT 2>/dev/null || echo "  (No process found or permission denied)"
elif command -v netstat &> /dev/null; then
    echo "Using netstat:"
    sudo netstat -tulpn | grep :$PORT || echo "  (No process found)"
elif command -v ss &> /dev/null; then
    echo "Using ss:"
    sudo ss -tulpn | grep :$PORT || echo "  (No process found)"
else
    echo "❌ No port checking tools available (lsof, netstat, or ss)"
fi

echo ""
echo "💡 Solutions:"
echo "   1. Stop the existing PostgreSQL service:"
echo "      sudo systemctl stop postgresql"
echo ""
echo "   2. Or change Docker to use a different port:"
echo "      Edit .env and set DB_PORT=5433"
echo "      Then update apps/api/.env to match"
