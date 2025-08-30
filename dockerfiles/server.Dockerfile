FROM oven/bun:1.2.21 as base

WORKDIR /app

# Install curl
RUN apt-get update && apt-get install -y curl
RUN curl -fsSL https://get.pulumi.com | sh

COPY ./package.json ./
COPY bun.lock ./
RUN mkdir server
RUN mkdir pkgs
RUN mkdir pkgs/client
COPY ./pkgs/client/package.json ./pkgs/client/package.json
COPY ./server/package.json ./server/

ENV PATH="/root/.pulumi/bin:$PATH"

RUN bun install --frozen-lockfile

COPY . .
USER bun
EXPOSE 3000/tcp
WORKDIR /app/server
CMD [ "bun", "dev"]
