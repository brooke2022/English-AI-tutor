# ──────────────── Stage 1: builder ────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install deps separately to leverage layer cache
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# Copy sources
COPY prisma ./prisma
COPY tsconfig*.json nest-cli.json ./
COPY src ./src

# Generate Prisma client + build TS
RUN npx prisma generate && npm run build

# Strip dev deps for the runner stage
RUN npm prune --omit=dev --legacy-peer-deps

# ──────────────── Stage 2: runner ────────────────
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nest -u 1001 -G nodejs

# Copy production artifacts
COPY --from=builder --chown=nest:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nest:nodejs /app/dist ./dist
COPY --from=builder --chown=nest:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nest:nodejs /app/package.json ./package.json

USER nest
EXPOSE 4000

# Apply pending migrations on boot, then start
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]
