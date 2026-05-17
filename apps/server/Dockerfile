FROM node:22-bullseye-slim AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.8.0 --activate
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps ./apps
COPY packages ./packages
RUN pnpm install
RUN pnpm --filter @pern-auth/server prisma:generate
RUN pnpm --filter @pern-auth/server build

FROM node:22-bullseye-slim
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.8.0 --activate
# only runtime output
COPY --from=builder /app/apps/server/dist ./dist
COPY --from=builder /app/apps/server/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
# production deps only (important for Prisma runtime)
RUN pnpm install --prod --frozen-lockfile
CMD ["node", "dist/index.js"]