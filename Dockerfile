FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache openssl sqlite

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

RUN pnpm install --frozen-lockfile

COPY . .

RUN npx prisma generate
RUN ls -l /app/prisma
RUN cat /app/prisma/schema.prisma
RUN echo "Running prisma migrate deploy"
RUN npx prisma migrate deploy
RUN echo "prisma migrate deploy complete"

RUN adduser -D adrrbot
RUN chown -R adrrbot:adrrbot /app/prisma
USER adrrbot

CMD [ "pnpm", "start:production" ]