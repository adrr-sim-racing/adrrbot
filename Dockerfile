FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache openssl sqlite

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

RUN pnpm install --frozen-lockfile --ignore-scripts

RUN pnpm exec prisma generate

COPY . .

RUN pnpm build

CMD ["sh", "-c", "npx prisma migrate deploy && pnpm start:production"]