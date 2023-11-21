import { html } from "@elysiajs/html";
import { Elysia } from "elysia";
import { BaseHtml } from "./components/BaseHtml";

const app = new Elysia()
  .use(html())

  .get("/", ({ set }) => {
    return (
      <BaseHtml>
        <body class="m-9 bg-green-200">
          <div>Hello Drew</div>
        </body>
      </BaseHtml>
    );
  })

  .get("/styles.css", ({ set }) => {
    set.headers["Cache-Control"] = "public, max-age=86400";
    return Bun.file("./tailwind-gen/styles.css");
  })

  .get("/spinner", ({ set }) => {
    set.headers["Cache-Control"] = "public, max-age=86400";
    return Bun.file("./90-ring.svg");
  })

  .listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);
