#!/bin/bash
set -e

echo "=========================================================="
echo "  🚀 PredicVerse — Production VPS Deployment Script"
echo "=========================================================="

# 1. Check for Docker
if ! command -v docker &> /dev/null; then
    echo "⚠️ Docker is not installed. Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo "✅ Docker installed successfully."
fi

# 2. Check for Docker Compose
if ! docker compose version &> /dev/null; then
    echo "⚠️ Docker Compose plugin not found. Installing..."
    sudo apt-get update && sudo apt-get install -y docker-compose-plugin
fi

# 3. Setup .env from .env.docker.example if .env does not exist
if [ ! -f .env ]; then
    echo "📄 Creating .env from .env.docker.example..."
    cp .env.docker.example .env
    
    # Generate random JWT_SECRET
    RANDOM_JWT=$(openssl rand -hex 64 2>/dev/null || node -e "console.log(require('crypto').randomBytes(64).toString('hex'))" 2>/dev/null || head -c 32 /dev/urandom | xxd -p)
    if [ -n "$RANDOM_JWT" ]; then
        sed -i "s/^JWT_SECRET=.*/JWT_SECRET=$RANDOM_JWT/" .env
    fi
    echo "🔐 Generated fresh secure JWT_SECRET."
fi

# 4. Pull and Build Containers
echo "📦 Building and starting PredicVerse containers..."
docker compose pull || true
docker compose up -d --build

# 5. Wait for Healthcheck
echo "⏳ Waiting for services to initialize..."
sleep 10

# 6. Verify Status
docker compose ps

echo ""
echo "=========================================================="
echo "  🎉 PredicVerse successfully deployed!"
echo "  Frontend: http://localhost (or http://<YOUR_VPS_IP>)"
echo "  Backend API: http://localhost:3001/health"
echo "=========================================================="
