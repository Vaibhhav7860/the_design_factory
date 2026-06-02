# syntax=docker/dockerfile:1.7
# ─────────────────────────────────────────────────────────────────────
# The Design Factory — production container for Cloud Run
# Multi-stage build to keep the final image small.
# Result: ~150 MB image, sub-2-second cold starts on Cloud Run.
# ─────────────────────────────────────────────────────────────────────

# Pin to Node 22 LTS to match what Vercel builds on. Use the slim
# Debian image; Alpine occasionally has issues with sharp + bcrypt.
ARG NODE_VERSION=22

# ── Stage 1: install dependencies ────────────────────────────────────
FROM node:${NODE_VERSION}-bookworm-slim AS deps
WORKDIR /app

# OpenSSL is needed by mongoose's connection at runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json .npmrc ./
# legacy-peer-deps is in .npmrc; matches what Vercel uses
RUN npm ci --include=dev

# ── Stage 2: build ───────────────────────────────────────────────────
FROM node:${NODE_VERSION}-bookworm-slim AS builder
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Some env vars are needed at BUILD time (NEXT_PUBLIC_*). Cloud Build
# passes them in via --build-arg; we expose them as ARG/ENV here.
ARG NEXT_PUBLIC_RAZORPAY_KEY_ID
ENV NEXT_PUBLIC_RAZORPAY_KEY_ID=${NEXT_PUBLIC_RAZORPAY_KEY_ID}

RUN npm run build

# ── Stage 3: runtime ─────────────────────────────────────────────────
FROM node:${NODE_VERSION}-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Cloud Run sets PORT=8080 and expects the app to bind to 0.0.0.0
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

# Non-root user for hardening
RUN groupadd --system --gid 1001 nextjs \
    && useradd --system --uid 1001 --gid nextjs nextjs

# Copy the standalone output (everything we need: server.js + minimal node_modules)
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nextjs /app/public ./public

USER nextjs

EXPOSE 8080

CMD ["node", "server.js"]
