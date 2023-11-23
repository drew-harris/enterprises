import { logger } from "@bogeychan/elysia-logger";
import { HoltLogger } from "@tlscipher/holt";
import { bethStack } from "beth-stack/elysia";
import { Elysia } from "elysia";
import pretty from "pino-pretty";
import { config } from "./config";
import { db } from "./db";

const stream = pretty({
  colorize: true,
});

export const ctx = new Elysia({
  name: "@app/ctx",
})
  .decorate("db", db)
  .decorate("config", config)
  // .decorate("auth", auth)
  .use(
    // @ts-ignore
    logger({
      level: config.LOG_LEVEL,
      stream: config.NODE_ENV === "development" ? stream : undefined,
      autoLogging: false,
    })
  )
  .use(bethStack())
  .use(
    // @ts-ignore
    config.NODE_ENV === "development" ? new HoltLogger().getLogger() : (a) => a
  )
  .onStart(({ log }) => {
    if (log && config.NODE_ENV === "production") {
      log.info("Server started");
    }
  })
  .onStop(({ log }) => {
    if (log && config.NODE_ENV === "production") {
      log.info("Server stopped");
    }
  })
  .onRequest(({ log, request }) => {
    if (log && config.NODE_ENV === "production") {
      log.debug(`Request received: ${request.method}: ${request.url}`);
    }
  })
  .onResponse(({ log, request }) => {
    if (log && config.NODE_ENV === "production") {
      log.debug(`Response sent: ${request.method}: ${request.url}`);
    }
  })
  .onError(({ log, error }) => {
    if (log && config.NODE_ENV === "production") {
      log.error(error);
    }
  });
