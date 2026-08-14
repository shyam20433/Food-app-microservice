FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN node ace build --production

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/build ./
RUN npm ci --production
EXPOSE 3337
CMD ["node", "server.js"]
