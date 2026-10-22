#!/bin/sh
set -e

echo "[PredicVerse Server] Running database migrations..."
npx prisma migrate deploy

echo "[PredicVerse Server] Populating initial seed data (Hidden Gems)..."
npx tsx prisma/seed.ts || echo "[PredicVerse Server] Seed completed or already populated."

echo "[PredicVerse Server] Starting Express API Server..."
exec node dist/index.js
