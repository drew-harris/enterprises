import { logger } from "@bogeychan/elysia-logger";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { Elysia } from "elysia";
import { Err, Ok } from "neverthrow";
import { auth } from "./auth";
import { base } from "./base";
import { db } from "./db";
import { ErrorWithStatus } from "./errors";
import { Caddy } from "./lib/caddy";
import { Storage } from "./lib/storage";
import { storage } from "./routes/storage";

const app = new Elysia()
  .onAfterHandle(({ response, set }) => {
    const result = response as any;
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
  .use(base)
  .use(auth)
  .use(
    logger({
      level: "info",
    }),
  )
  .use(storage)
  .get("/", () => "One more update test");

// Init stuff
if (!import.meta.hot) {
  await Promise.all([
    Storage.init(),
    migrate(db, {
      migrationsFolder: "./drizzle",
    }),
    Caddy.ensureMinimumConfigForOperation(),
  ]);
}

Bun.serve({
  fetch(request) {
    return app.handle(request);
  },
});
