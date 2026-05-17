# ---------- Builder ----------
FROM node:22-bullseye-slim AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/server/package.json ./apps/server/
COPY packages ./packages
RUN corepack enable && corepack prepare pnpm@9.8.0 --activate
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter server build
# ---------- Runtime ----------
FROM node:22-bullseye-slim
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.8.0 --activate
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/apps/server/package.json ./apps/server/package.json
# IMPORTANT
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/server/dist ./dist
EXPOSE 4000
CMD ["node", "dist/app.js"]