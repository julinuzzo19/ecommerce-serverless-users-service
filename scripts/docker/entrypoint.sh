#!/bin/sh
set -eu

cd /app

# serverless-plugin-typescript writes into .build and creates symlinks.
# With bind mounts, .build can persist across restarts and the plugin may crash
# with EEXIST when trying to recreate those links.
rm -rf ".build" || true

# When using bind mounts in docker-compose, /app/node_modules might be an empty volume.
# Ensure dependencies exist before running any node scripts.
if [ ! -f "node_modules/@aws-sdk/client-dynamodb/package.json" ]; then
  echo "📦 Installing dependencies (first run)..."
  if [ -f "package-lock.json" ]; then
    npm ci --legacy-peer-deps
  else
    npm install --legacy-peer-deps
  fi
fi

echo "⏳ Waiting for DynamoDB Local..."
node scripts/dynamodb/wait.js

echo "🧱 Ensuring users table exists..."
node scripts/dynamodb/init-users-table.js

echo "🚀 Starting serverless-offline on :3012"
exec npx serverless offline --stage docker --host 0.0.0.0 --httpPort 3012
