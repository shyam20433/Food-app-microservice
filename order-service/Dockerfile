# Base stage for building
FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN node ace generate:manifest
RUN node ace build --production

# Production stage
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3335
ENV HOST=0.0.0.0

COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps

COPY --from=builder /app/build ./

EXPOSE 3335
CMD ["node", "server.js"]
