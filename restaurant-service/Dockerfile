# Multi-stage Docker build for Restaurant Service microservice
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN node ace build --production

FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3334
ENV HOST=0.0.0.0

COPY --from=builder /app/build ./

RUN yarn install --production

EXPOSE 3334

CMD ["node", "server.js"]
