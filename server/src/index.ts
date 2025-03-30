import { Elysia } from "elysia";
import { base } from "./base";
import { auth } from "./auth";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "./db";
import { storage } from "./routes/storage";
import { logger } from "@bogeychan/elysia-logger";

const app = new Elysia()
  .use(base)
  .use(auth)
  .use(
    logger({
      level: "info",
    }),
  )
  .use(storage)
  .get("/", () => "One more update test")
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

export type App = typeof app;

migrate(db, {
  migrationsFolder: "./drizzle",
});
