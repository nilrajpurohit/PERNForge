# # Builder
# FROM node:22-bullseye-slim AS builder
# WORKDIR /app
# RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
# COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
# COPY apps ./apps
# COPY packages ./packages
# RUN pnpm install --frozen-lockfile
# RUN pnpm --filter @pern-auth/server prisma:generate
# RUN pnpm --filter @pern-auth/server build

# # Production
# FROM node:22-bullseye-slim
# WORKDIR /app
# RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
# COPY --from=builder /app/package.json ./
# COPY --from=builder /app/pnpm-lock.yaml ./
# COPY --from=builder /app/pnpm-workspace.yaml ./
# COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/apps/server ./apps/server
# WORKDIR /app/apps/server
# EXPOSE 4000
# CMD ["sh", "-c", "pnpm prisma:migrate:deploy && node dist/index.js"]



# -------------------------
# Builder stage
# -------------------------
FROM node:22-bullseye-slim AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps ./apps
COPY packages ./packages
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @pern-auth/server prisma:generate
RUN pnpm --filter @pern-auth/server build
# -------------------------
# Runner stage
# -------------------------
FROM node:22-bullseye-slim AS runner
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
RUN pnpm install --prod --frozen-lockfile
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/apps/server/prisma ./apps/server/prisma
WORKDIR /app/apps/server
EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy --schema=./prisma/schema.prisma && node dist/index.js"]