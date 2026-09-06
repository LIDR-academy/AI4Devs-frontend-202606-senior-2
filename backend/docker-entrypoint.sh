#!/bin/sh
# Prepares the backend container: dependencies, Prisma client, schema, seed data.
set -e

# node_modules is a bind mount under <project root>/.docker-cache, so it outlives
# both the container and the image. Reinstall only when the lockfile changed;
# the stamp records the lockfile the current tree was installed from.
stamp=node_modules/.docker-install-stamp
lock=$(md5sum package-lock.json | cut -d' ' -f1)
if [ "$(cat "$stamp" 2>/dev/null)" != "$lock" ]; then
    echo "==> backend: installing dependencies (npm cache: ${npm_config_cache})"
    npm ci --prefer-offline
    echo "$lock" > "$stamp"
else
    echo "==> backend: dependencies up to date"
fi

echo "==> backend: generating Prisma client"
npx --no-install prisma generate

echo "==> backend: applying migrations"
npx --no-install prisma migrate deploy

# prisma/seed.ts uses create() throughout, so it is not idempotent: only run it
# against a database that has never been seeded.
companies=$(node -e 'const {PrismaClient} = require("@prisma/client"); const p = new PrismaClient(); p.company.count().then(n => console.log(n)).catch(() => console.log("?")).finally(() => p.$disconnect())')
if [ "$companies" = "0" ]; then
    echo "==> backend: seeding database"
    npx --no-install ts-node prisma/seed.ts
else
    echo "==> backend: database already seeded (${companies} companies)"
fi

echo "==> backend: starting $*"
exec "$@"
