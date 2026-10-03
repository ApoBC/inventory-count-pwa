FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY tsconfig.json vite.config.ts postcss.config.js tailwind.config.js ./
COPY public ./public
COPY src ./src
COPY index.html ./
RUN pnpm build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
EXPOSE 5173
ENV NODE_ENV=production
CMD ["npx", "vite", "preview", "--host", "0.0.0.0"]
