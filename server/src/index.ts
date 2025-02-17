import { Elysia } from "elysia";
import { base } from "./base";

const app = new Elysia()
  .use(base)
  .get("/", () => "Wow this is fast")
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
