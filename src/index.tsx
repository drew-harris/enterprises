import { html } from "@elysiajs/html";
import staticPlugin from "@elysiajs/static";
import { Elysia } from "elysia";
import { BaseHtml } from "./components/BaseHtml";
import { config } from "./config";

const app = new Elysia()
  .use(html())
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

  .get("/", () => {
    return (
      <BaseHtml>
        <body class="m-9 bg-red-500">
          <div>Hello Drew</div>
        </body>
      </BaseHtml>
    );
  })

  .listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);
export type App = typeof app;
