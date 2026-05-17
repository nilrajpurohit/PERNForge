FROM node:22-bullseye-slim AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.8.0 --activate
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps ./apps
COPY packages ./packages
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @pern-auth/server prisma:generate
RUN pnpm --filter @pern-auth/server build

FROM node:22-bullseye-slim
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.8.0 --activate
# install ONLY production deps for server
RUN pnpm install --prod --filter @pern-auth/server...
# only runtime output
COPY --from=builder /app/apps/server/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/apps/server/package.json ./apps/server/package.json
# copy installed runtime dependencies from the builder stage
COPY --from=builder /app/node_modules ./node_modules
# (no runtime install here; builder already installed deps for the workspace)
EXPOSE 4000
CMD ["node", "dist/index.js"]