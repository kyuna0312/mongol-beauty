#!/bin/bash

# Docker Compose wrapper that supports both 'docker compose' and 'docker-compose'
# Usage: ./scripts/docker-compose.sh [command] [args...]

set -e

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not in PATH"
    echo ""
    echo "Please install Docker:"
    echo "  - macOS: https://docs.docker.com/desktop/install/mac-install/"
    echo "  - Linux: https://docs.docker.com/engine/install/"
    echo "  - Windows: https://docs.docker.com/desktop/install/windows-install/"
    exit 1
fi

# Try 'docker compose' (newer Docker plugin) first, fallback to 'docker-compose'
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
else
    echo "❌ Docker Compose is not available"
    echo ""
    echo "Please install Docker Compose:"
    echo "  - It's included with Docker Desktop"
    echo "  - Or install separately: https://docs.docker.com/compose/install/"
    exit 1
fi

# Execute the command
$DOCKER_COMPOSE_CMD "$@"
