# syntax=docker/dockerfile:1
# Multi-stage production Dockerfile for Google Cloud Run
# NexusAI - AI World Radar & Professional Upskilling Hub

# -------------------------------------------------------------------
# Stage 1: Build Frontend & Dependencies
# -------------------------------------------------------------------
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Install build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install npm dependencies
COPY package*.json ./
RUN npm ci

# Copy project files
COPY . .

# Run icon generation and build Vite frontend production bundle
RUN python3 scripts/generate_png_icons.py
RUN npm run build

# -------------------------------------------------------------------
# Stage 2: Production Container for Cloud Run
# -------------------------------------------------------------------
FROM node:20-bookworm-slim AS runner

WORKDIR /app

# Install Python 3 for live AI radar collector and Python execution lab
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
# Google Cloud Run injects the PORT environment variable (default: 8080)
ENV PORT=8080

# Copy package and dependencies
COPY package*.json ./
RUN npm ci --only=production

# Install tsx globally or locally to run TypeScript server
RUN npm install -g tsx

# Copy built frontend assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Copy server, scripts, and runtime assets
COPY server.ts ./
COPY scripts ./scripts
COPY tsconfig.json ./

# Verify Python works
RUN python3 -c "print('Cloud Run Python 3 Runtime Ready')"

# Expose Cloud Run port
EXPOSE 8080

# Run healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/api/health || exit 1

# Start the full-stack server
CMD ["tsx", "server.ts"]
