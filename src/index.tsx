import { html } from "@elysiajs/html";
import staticPlugin from "@elysiajs/static";
import { Elysia } from "elysia";
import { config } from "./config";
import { BaseHtml } from "./components/BaseHtml";

const app = new Elysia()
  .use(
    staticPlugin({
      prefix: "",
    })
  )
  .use(html())
  .onStart(() => {
    if (config.NODE_ENV === "development") {
      void fetch("http://localhost:3001/restart");
      console.log("🦊 Triggering Live Reload");
    }
  })

  .get("/", async () => {
    return (
      <BaseHtml>
        <div class="bg-purple-400/50 p-3 text-xl font-bold text-center">
          Drewh Cloud Enterprises
        </div>
        <div class="flex justify-center pt-8">
          <button class="bg-purple-800/50 p-3 font-bold rounded-lg">
            Sign In
          </button>
        </div>
      </BaseHtml>
    );
  })

  .listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);

export type App = typeof app;
