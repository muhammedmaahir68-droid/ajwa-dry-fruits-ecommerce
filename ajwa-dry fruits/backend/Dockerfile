# ==============================================================================
# Ajwa AI Commerce - Backend API Gateway Dockerfile
# Production-ready container for Express.js API Gateway
# ==============================================================================

FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install dependencies (ignoring optional dev dependencies)
RUN npm ci --omit=dev --silent || npm install --omit=dev

# Copy application code
COPY . .

# Environment setup
ENV NODE_ENV=production
ENV PORT=8000

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:8000/ || exit 1

CMD ["node", "server.js"]
