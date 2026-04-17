# ---- Stage 1: Build ----
FROM node:20-alpine AS builder
WORKDIR /app

# Copy monorepo manifests first (layer cache for yarn install)
COPY package.json yarn.lock tsconfig.base.json ./
COPY packages/ ./packages/
COPY apps/web/ ./apps/web/

RUN yarn install --frozen-lockfile

# VITE_GRAPHQL_URL baked into the static bundle at build time
ARG VITE_GRAPHQL_URL=https://api.mcosmetics.mn/graphql
ENV VITE_GRAPHQL_URL=$VITE_GRAPHQL_URL

RUN yarn workspace @mongol-beauty/web build

# ---- Stage 2: Serve ----
FROM nginx:alpine AS runner
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
