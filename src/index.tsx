import staticPlugin from "@elysiajs/static";
import { Elysia } from "elysia";
import { config } from "./config";
import { ctx } from "./context";
import { BaseHtml } from "./components/BaseHtml";

const app = new Elysia()
  .use(
    staticPlugin({
      prefix: "",
    })
  )
  .use(ctx)
  .onStart(() => {
    if (config.NODE_ENV === "development") {
      void fetch("http://localhost:3001/restart");
      console.log("🦊 Triggering Live Reload");
    }
  })

  .get("/hx/gesli", () => {
    return <div></div>;
  })

  .get("/", async ({ html }) => {
    return html(() => (
      <BaseHtml>
        <div class="bg-purple-400 p-4 text-xl font-bold">
          Drewh Cloud Enterprises
        </div>
        <div class="p-8">Welcome to the new AWS</div>
      </BaseHtml>
    ));
  })

  .listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);

export type App = typeof app;
