# FROM node:22-alpine AS builder
# WORKDIR /app
# RUN corepack enable && corepack prepare pnpm@9.8.0 --activate
# # monorepo root files (from build context)
# COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
# # source
# COPY apps ./apps
# COPY packages ./packages
# RUN pnpm install
# RUN pnpm --filter @pern-auth/client build
# # Install static file server
# EXPOSE 4173
# CMD ["pnpm", "dlx", "serve", "-s", "apps/client/dist", "-l", "4173"]



# -------------------------
# 1. Builder stage
# -------------------------
FROM node:22-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable && corepack prepare pnpm@9.8.0 --activate
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps ./apps
COPY packages ./packages
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @pern-auth/client build

# -------------------------
# 2. Production runtime
# -------------------------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN npm install -g serve@14.2.0
COPY --from=builder /app/apps/client/dist ./dist
RUN addgroup -S pernforgegroup && adduser -S pernforgeuser -G pernforgegroup
RUN chown -R pernforgeuser:pernforgegroup /app/dist
USER pernforgeuser
EXPOSE 4173
CMD ["serve", "-s", "dist", "-l", "4173"]