FROM node:22-bookworm-slim AS deps
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm@12.8.2
WORKDIR /app
COPY package.json ./
RUN pnpm install --lockfile=false

FROM deps AS builder
COPY . .
RUN pnpm exec prisma generate --schema prisma/schema.prisma && pnpm run build

FROM node:22-bookworm-slim AS runner
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm@12.8.2
ENV NODE_ENV=production
WORKDIR /app
COPY package.json ./
COPY --from=builder /app/prisma ./prisma
RUN pnpm install --prod --lockfile=false && pnpm exec prisma generate --schema prisma/schema.prisma
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh
USER node
EXPOSE 4000
ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "dist/server.mjs"]
