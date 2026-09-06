#!/bin/sh
# Prepares the frontend container: dependencies only.
set -e

# node_modules is a bind mount under <project root>/.docker-cache, so it outlives
# both the container and the image. Reinstall only when the lockfile changed;
# the stamp records the lockfile the current tree was installed from.
stamp=node_modules/.docker-install-stamp
lock=$(md5sum package-lock.json | cut -d' ' -f1)
if [ "$(cat "$stamp" 2>/dev/null)" != "$lock" ]; then
    echo "==> frontend: installing dependencies (npm cache: ${npm_config_cache})"
    npm ci --prefer-offline
    echo "$lock" > "$stamp"
else
    echo "==> frontend: dependencies up to date"
fi

echo "==> frontend: starting $*"
exec "$@"
