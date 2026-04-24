FROM node:20-slim

WORKDIR /app

EXPOSE 3001

# npm install runs at container startup so it has full network access.
# node_modules is persisted in a named volume (see docker-compose.yml)
# so this is only slow on the very first `docker compose up`.
CMD ["sh", "-c", "npm install && npm run dev"]
