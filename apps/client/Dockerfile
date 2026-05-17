FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.8.0 --activate
# monorepo root files (from build context)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
# source
COPY apps ./apps
COPY packages ./packages
RUN pnpm install
RUN pnpm --filter @pern-auth/client build
FROM nginx:stable-alpine
COPY --from=builder /app/apps/client/dist /usr/share/nginx/html