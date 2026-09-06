# Dev image for the Create React App frontend.
#
# Deliberately no `npm ci` here: dependencies are installed by the entrypoint
# into a bind mount under the project root (see docker-compose.yml), so they are
# never re-downloaded when this image is rebuilt.
FROM node:20-bookworm-slim

# npm's download cache is bind-mounted here from <project root>/.docker-cache/npm
ENV npm_config_cache=/npm-cache \
    npm_config_fund=false \
    npm_config_audit=false \
    npm_config_update_notifier=false
RUN mkdir -p /npm-cache && chmod 1777 /npm-cache

WORKDIR /app/frontend

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "start"]
