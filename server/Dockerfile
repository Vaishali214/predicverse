# ----------------------------------------------------
# PredicVerse Server — Production Dockerfile
# ----------------------------------------------------
FROM node:20-alpine

# Install OpenSSL and libc6-compat (required by Prisma engine on Alpine)
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy dependency manifests and Prisma schema first
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies and generate Prisma Client for Linux Alpine
RUN npm install
RUN npx prisma generate

# Copy the rest of the application source code
COPY . .

# Compile TypeScript to JavaScript in dist/
RUN npm run build

# Make entrypoint script executable
RUN chmod +x docker-entrypoint.sh

# Expose backend REST port
EXPOSE 3001

# Run migrations, seed, and start server
ENTRYPOINT ["./docker-entrypoint.sh"]
