# Dev image for the Express/Prisma backend.
#
# Deliberately no `npm ci` here: dependencies are installed by the entrypoint
# into a bind mount under the project root (see docker-compose.yml), so they are
# never re-downloaded when this image is rebuilt.
FROM node:20-bookworm-slim

# Prisma's query engine needs OpenSSL (binaryTargets debian-openssl-3.0.x).
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# npm's download cache is bind-mounted here from <project root>/.docker-cache/npm
ENV npm_config_cache=/npm-cache \
    npm_config_fund=false \
    npm_config_audit=false \
    npm_config_update_notifier=false
RUN mkdir -p /npm-cache && chmod 1777 /npm-cache

WORKDIR /app/backend

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

EXPOSE 3010
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "run", "dev"]
