#!/bin/bash

# Fix port 5432 conflict
# Usage: bash scripts/fix-port-conflict.sh [port]

NEW_PORT=${1:-5433}

echo "🔧 Fixing port 5432 conflict..."
echo ""

# Check if PostgreSQL service is running
if systemctl is-active --quiet postgresql 2>/dev/null; then
    echo "⚠️  PostgreSQL service is running"
    echo ""
    echo "Options:"
    echo "  1. Stop PostgreSQL service (recommended if not needed):"
    echo "     sudo systemctl stop postgresql"
    echo "     sudo systemctl disable postgresql  # Prevent auto-start"
    echo ""
    echo "  2. Use different port for Docker (port $NEW_PORT):"
    echo "     This script will update your .env files"
    echo ""
    read -p "Stop PostgreSQL service? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sudo systemctl stop postgresql
        echo "✅ PostgreSQL stopped"
        echo "   To prevent auto-start: sudo systemctl disable postgresql"
    else
        echo "📝 Switching Docker to port $NEW_PORT..."
        USE_NEW_PORT=true
    fi
else
    echo "ℹ️  PostgreSQL service not running, but port 5432 is still in use"
    echo "   Switching Docker to port $NEW_PORT..."
    USE_NEW_PORT=true
fi

if [ "$USE_NEW_PORT" = true ]; then
    echo ""
    echo "Updating configuration files..."
    
    # Update root .env
    if [ -f .env ]; then
        if grep -q "^DB_PORT=" .env; then
            sed -i "s/^DB_PORT=.*/DB_PORT=$NEW_PORT/" .env
        else
            echo "DB_PORT=$NEW_PORT" >> .env
        fi
        echo "✅ Updated .env (DB_PORT=$NEW_PORT)"
    fi
    
    # Update backend .env
    if [ -f apps/api/.env ]; then
        if grep -q "^DB_PORT=" apps/api/.env; then
            sed -i "s/^DB_PORT=.*/DB_PORT=$NEW_PORT/" apps/api/.env
        else
            echo "DB_PORT=$NEW_PORT" >> apps/api/.env
        fi
        echo "✅ Updated apps/api/.env (DB_PORT=$NEW_PORT)"
    fi
    
    echo ""
    echo "✅ Configuration updated!"
    echo "   Docker will now use port $NEW_PORT"
    echo "   Backend will connect to port $NEW_PORT"
fi

echo ""
echo "📝 Next steps:"
echo "   1. Clean up failed container: yarn docker:down"
echo "   2. Start database: yarn docker:up"
echo "   3. Verify: yarn docker:logs"
