# FROM bun # stuck with bun
FROM node
RUN npm i -g bun

WORKDIR /app
COPY package.json .
COPY prisma prisma
RUN bun i
COPY . .

RUN mkdir -p /app/.next/cache && chown nextjs:nodejs /app/.next/cache
VOLUME ["/app/.next/cache"]

RUN SKIP_ENV_VALIDATION=true \
    bun run build

CMD bun start