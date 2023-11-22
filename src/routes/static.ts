import Elysia from "elysia";

export const staticFiles = new Elysia()
  .get("/spinner", ({ set }) => {
    set.headers["Cache-Control"] = "public, max-age=86400";
    return Bun.file("./public/spinner.svg");
  })
  .get("/styles.css", ({ set }) => {
    set.headers["Cache-Control"] = "public, max-age=86400";
    return Bun.file("./public/styles.css");
  });
