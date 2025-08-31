import { logger } from "@bogeychan/elysia-logger";
import { migrate } from "drizzle-orm/bun-sql/migrator";
import { Elysia } from "elysia";
import { Err, Ok } from "neverthrow";
import { auth } from "./auth";
import { rawDb } from "./db";
import { ErrorWithStatus } from "./errors";
import { Caddy } from "./lib/caddy";
import { Pulumi } from "./lib/pulumi";
import { Storage } from "./lib/storage";
import { pino } from "./logging";
import { deployments } from "./routes/deployments";
import { storage } from "./routes/storage";

const app = new Elysia()
  .onAfterHandle(({ response, set }) => {
    const result = response;
    if (result instanceof Ok) {
      return result.value;
    }
    if (result instanceof Err) {
      if (result.error instanceof ErrorWithStatus) {
        set.status = result.error.status;
      } else {
        set.status = 500;
      }
      if (result.error instanceof Error) {
        return { error: result.error.message };
      } else {
        return { error: result.error };
      }
    }
    return response;
  })
  .use(auth)
  .use(
    logger({
      level: "info",
    }),
  )
  .use(storage)
  .use(deployments)
  .get("/ping", () => "pong")
  .get("/", () => "One more update test");

// Init stuff
if (!import.meta.hot) {
  await Promise.all([
    Storage.init(),
    pino.info("Initializing database"),
    migrate(rawDb, {
      migrationsFolder: "./drizzle",
    }),
    Caddy.ensureMinimumConfigForOperation(),
  ]);

  Pulumi.install();
}

Bun.serve({
  fetch(request) {
    return app.handle(request);
  },
});
