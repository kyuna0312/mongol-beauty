#!/bin/sh
# =============================================================================
# Mongol Beauty — One-time VPS setup
# Run once after cloning the repo on the production server:
#   chmod +x scripts/setup-server.sh && ./scripts/setup-server.sh
# =============================================================================
set -e

echo "==> Creating backup directory..."
mkdir -p /var/backups/mongol-beauty
chmod 750 /var/backups/mongol-beauty
echo "    /var/backups/mongol-beauty created"

echo "==> Creating Docker network..."
docker network create mongol-beauty-prod-network 2>/dev/null \
  && echo "    network created" \
  || echo "    network already exists, skipping"

echo "==> Setting up .env.prod..."
if [ ! -f .env.prod ]; then
  cp .env.prod.example .env.prod
  echo "    .env.prod created from template"
  echo ""
  echo "  !! ACTION REQUIRED: Fill in all <placeholder> values in .env.prod"
  echo "     Run: nano .env.prod"
  echo ""
else
  echo "    .env.prod already exists, skipping"
fi

echo ""
echo "==> Setup complete."
echo "    Next steps:"
echo "    1. Fill in secrets:   nano .env.prod"
echo "    2. Point DNS:         mcosmetic.mn → this server IP"
echo "                          api.mcosmetic.mn → this server IP"
echo "    3. Deploy:            ./scripts/deploy.sh"
