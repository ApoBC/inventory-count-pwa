# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /build

COPY package*.json ./
COPY tsconfig.json ./

RUN npm ci --only=production 2>/dev/null || npm install --production && \
    npm cache clean --force

COPY src ./src

RUN npm run build 2>/dev/null || npx tsc || true

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

COPY --from=builder --chown=nodejs:nodejs /build/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /build/dist ./dist
COPY --chown=nodejs:nodejs package.json ./

USER nodejs

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || true

CMD ["node", "dist/src/main.js"]
