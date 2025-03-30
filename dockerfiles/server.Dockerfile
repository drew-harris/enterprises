FROM oven/bun:1.2.2 as base

WORKDIR /app

# Install curl
RUN apt-get update && apt-get install -y curl

COPY ./package.json ./
COPY bun.lock ./
RUN mkdir server
RUN mkdir pkg
COPY ./pkg/package.json ./pkg/
COPY ./server/package.json ./server/

RUN bun install --frozen-lockfile

COPY . .
USER bun
EXPOSE 3000/tcp
WORKDIR /app/server
ENTRYPOINT [ "bun", "dev"]
