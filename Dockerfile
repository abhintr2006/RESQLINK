# ── Stage 1: Build Frontend SPA ───────────────────────────────────────────────
FROM node:22-alpine AS frontend-builder
WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Cache dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy frontend source files
COPY . .

# Build Vite React SPA into /app/dist
RUN pnpm run build

# ── Stage 2: Production Python Backend + Static SPA ───────────────────────────
FROM python:3.12-slim AS runner
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY server/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY server/ ./server/

# Copy compiled frontend from Stage 1 into /app/dist and /app/server/dist
COPY --from=frontend-builder /app/dist ./dist
COPY --from=frontend-builder /app/dist ./server/dist

ENV PORT=8000 \
    HOST=0.0.0.0 \
    PYTHONUNBUFFERED=1

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

WORKDIR /app/server

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
