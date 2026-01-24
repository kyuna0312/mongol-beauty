#!/bin/bash

# Wait for PostgreSQL to be ready
# Usage: ./scripts/wait-for-postgres.sh [host] [port] [user] [database]

HOST=${1:-localhost}
PORT=${2:-5433}
USER=${3:-postgres}
DB=${4:-mongol_beauty}
MAX_ATTEMPTS=30
ATTEMPT=0

echo "⏳ Waiting for PostgreSQL at $HOST:$PORT..."

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  if PGPASSWORD=postgres psql -h "$HOST" -p "$PORT" -U "$USER" -d "$DB" -c "SELECT 1;" >/dev/null 2>&1; then
    echo "✅ PostgreSQL is ready!"
    exit 0
  fi
  
  ATTEMPT=$((ATTEMPT + 1))
  echo "   Attempt $ATTEMPT/$MAX_ATTEMPTS - waiting..."
  sleep 2
done

echo "❌ PostgreSQL did not become ready after $MAX_ATTEMPTS attempts"
exit 1
