FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN node ace build --production

FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/build ./build
EXPOSE 3336
ENV PORT=3336
CMD ["node", "build/server.js"]
