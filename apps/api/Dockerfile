# ---- Stage 1: Build ----
FROM node:20-alpine AS builder
WORKDIR /app

# Copy monorepo manifests (layer cache for yarn install)
COPY package.json yarn.lock tsconfig.base.json ./
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

RUN yarn install --frozen-lockfile
RUN yarn workspace @mongol-beauty/api build

# ---- Stage 2: Run ----
FROM node:20-alpine AS runner
WORKDIR /app

# Copy only what's needed to run
COPY --from=builder /app/package.json /app/yarn.lock ./
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/node_modules ./node_modules

# Create upload dir and non-root user in one layer
RUN addgroup -S app && adduser -S app -G app \
    && mkdir -p /app/uploads/receipts \
    && chown -R app:app /app/uploads
USER app

EXPOSE 4000
CMD ["node", "apps/api/dist/main.js"]
