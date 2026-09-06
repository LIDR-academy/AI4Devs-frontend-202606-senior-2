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

# prisma/seed.ts is idempotent: every row is upserted by the fields that
# identify it, so running it against an already-seeded database updates the
# fixtures in place instead of duplicating them. That means it can run on every
# boot, which is what keeps an existing dev database in step with the fixtures
# without having to drop the volume.
#
# It only ever touches rows it owns; data created through the API (candidates
# and their applications) is left alone. An application's current phase is
# written only when the seed first creates it, so a candidate dragged to another
# column stays there across restarts rather than snapping back.
echo "==> backend: seeding database (idempotent)"
npx --no-install ts-node prisma/seed.ts

echo "==> backend: starting $*"
exec "$@"
