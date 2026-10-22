# ----------------------------------------------------
# Stage 1: Build Frontend SPA
# ----------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first for Docker cache optimization
COPY package*.json ./
RUN npm ci || npm install

# Copy source code and build production bundle
COPY . .

# Optional build-time API URL (empty defaults to same-origin /api proxied by Nginx)
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ----------------------------------------------------
# Stage 2: Serve via Lightweight Nginx Alpine
# ----------------------------------------------------
FROM nginx:alpine

# Copy built static artifacts
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy optimized Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
