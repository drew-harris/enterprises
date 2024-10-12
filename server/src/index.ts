import jwt from "@elysiajs/jwt";
import { Elysia } from "elysia";

const app = new Elysia()
  .get("/", () => "Hello Elysia")
  .use(
    jwt({
      name: "keys",
      secret: process.env.JWT_SECRET!,
    }),
  )
  .post("/api-key", async ({ keys }) => {
    const key = await keys.sign({
      name: "Drew",
    });

    return {
      key,
    };
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
