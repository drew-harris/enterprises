import { Elysia } from "elysia";
import { base } from "./base";
import { auth } from "./auth";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "./db";

const app = new Elysia()
  .use(base)
  .use(auth)
  .get("/", () => "We have migrations working")
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

migrate(db, {
  migrationsFolder: "./drizzle",
});
