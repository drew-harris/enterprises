import { html } from "@elysiajs/html";
import { Elysia } from "elysia";
import { BaseHtml } from "./components/BaseHtml";
import { staticFiles } from "./routes/static";

const app = new Elysia()
  .use(html())
  .use(staticFiles)

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
