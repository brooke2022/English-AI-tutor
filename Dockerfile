# ──────────────── Stage 1: builder ────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Build-time API base (e.g. https://api.example.com/api/v1)
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

COPY tsconfig*.json vite.config.ts index.html ./
COPY src ./src
COPY public* ./public

RUN npm run build

# ──────────────── Stage 2: nginx runner ────────────────
FROM nginx:1.27-alpine AS runner

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
