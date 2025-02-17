FROM oven/bun:1.2.2 as base

WORKDIR /app

COPY . .
RUN bun install --frozen-lockfile
USER bun
EXPOSE 3000/tcp
WORKDIR /app/server
ENTRYPOINT [ "bun", "dev"]
