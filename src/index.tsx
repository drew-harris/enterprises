import staticPlugin from "@elysiajs/static";
import { Elysia } from "elysia";
import { BaseHtml } from "./components/BaseHtml";
import { Button } from "./components/shared/Button";
import { config } from "./config";
import { ctx } from "./context";

const app = new Elysia()
  .use(
    staticPlugin({
      prefix: "",
    }),
  )
  .use(ctx)
  .onStart(() => {
    if (config.NODE_ENV === "development") {
      void fetch("http://localhost:3001/restart");
      console.log("🦊 Triggering Live Reload");
    }
  })

  .get("/", async () => {
    return (
      <BaseHtml>
        <div class="border-b border-b-purple-400/40 bg-purple-400/50 p-3 text-center text-xl font-bold shadow shadow-purple-950">
          Drew's HTMX Starter
        </div>
        <div class="flex justify-center pt-8">
          <Button>Sign Up</Button>
        </div>
      </BaseHtml>
    );
  })

  .listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`,
);

export type App = typeof app;
