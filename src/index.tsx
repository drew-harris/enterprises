import staticPlugin from "@elysiajs/static";
import { Elysia } from "elysia";
import { config } from "./config";

const app = new Elysia()
  .use(
    staticPlugin({
      prefix: "",
    })
  )
  .onStart(() => {
    if (config.NODE_ENV === "development") {
      void fetch("http://localhost:3001/restart");
      console.log("🦊 Triggering Live Reload");
    }
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);
export type App = typeof app;
