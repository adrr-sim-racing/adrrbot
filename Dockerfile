FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache openssl sqlite

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

RUN pnpm install --frozen-lockfile

COPY . .

RUN npx prisma generate
RUN npx prisma migrate deploy

CMD [ "pnpm", "start:production" ]
