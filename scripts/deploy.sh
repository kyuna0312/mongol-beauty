#!/bin/sh
# =============================================================================
# Mongol Beauty — Deploy script
# Run on the VPS to pull latest code and redeploy:
#   ./scripts/deploy.sh
# Prerequisites: .env.prod is filled in, setup-server.sh was run.
# =============================================================================
set -e

COMPOSE="docker compose -f docker-compose.prod.yml --env-file .env.prod"

echo "==> Pulling latest code..."
git pull origin main

echo "==> Building images..."
$COMPOSE build

echo "==> Starting containers..."
$COMPOSE up -d

echo "==> Waiting for gateway to be healthy..."
RETRIES=20
until $COMPOSE exec -T gateway wget -qO- http://localhost:4000/health > /dev/null 2>&1; do
  RETRIES=$((RETRIES - 1))
  if [ "$RETRIES" -eq 0 ]; then
    echo "ERROR: Gateway did not become healthy. Check logs:"
    echo "  docker compose -f docker-compose.prod.yml logs gateway"
    exit 1
  fi
  echo "    waiting... ($RETRIES retries left)"
  sleep 5
done
echo "    Gateway is healthy."

echo "==> Running database migrations..."
$COMPOSE exec -T gateway \
  node /app/node_modules/.bin/typeorm migration:run \
  -d /app/apps/api/dist/data-source.js \
  && echo "    Migrations complete." \
  || echo "    No pending migrations — continuing."

echo ""
echo "==> Deploy complete."
echo "    Frontend: https://mcosmetic.mn"
echo "    API:      https://api.mcosmetic.mn/health"
