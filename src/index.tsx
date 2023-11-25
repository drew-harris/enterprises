import staticPlugin from "@elysiajs/static";
import { Elysia } from "elysia";
import { BaseHtml } from "./components/BaseHtml";
import { config } from "./config";
import { ctx } from "./context";
import { authRoutes } from "./routes/auth";

const app = new Elysia()
  .use(
    staticPlugin({
      prefix: "",
    }),
  )
  .use(ctx)
  .use(authRoutes)

  .get("/", ({ session }) => {
    return (
      <BaseHtml>
        <div class="border-b border-b-purple-400/40 bg-purple-400/50 p-3 text-center text-xl font-bold shadow shadow-purple-950">
          Drew's HTMX Starter
        </div>
        <div class="flex justify-center pt-8">
          <a
            href="/signin"
            class="cursor-pointer rounded-lg border border-purple-500/40 bg-purple-800/50 p-3 font-bold hover:bg-purple-800/70"
          >
            Sign In With Github
          </a>
        </div>
        <div>
          {session ? "Logged in as " + session?.user.username : "Not Logged In"}
        </div>
      </BaseHtml>
    );
  })

  .onStart(() => {
    if (config.NODE_ENV === "development") {
      void fetch("http://localhost:3001/restart");
      console.log("🦊 Triggering Live Reload");
    }
  })

  .listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`,
);

export type App = typeof app;
