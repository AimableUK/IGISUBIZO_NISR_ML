#!/bin/sh
set -e
cd /app
if [ -d prisma/migrations ] && [ "$(ls -A prisma/migrations 2>/dev/null)" ]; then
  pnpm exec prisma migrate deploy
else
  echo "No migrations found: syncing schema with 'prisma db push'. Run 'pnpm run prisma:migrate' to create your first migration."
  pnpm exec prisma db push --skip-generate
fi
exec "$@"
