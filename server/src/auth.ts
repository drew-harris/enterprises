import Elysia, { t } from "elysia";
import { Env } from "./env";

export const auth = new Elysia({ prefix: "/auth" }).get(
  "/forward",
  ({ headers, set }) => {
    if (Env.env.DISABLE_AUTH) {
      return "Working auth";
    }
    if (headers["root-key"] && headers["root-key"] === Env.env.ROOT_KEY) {
      return "Working auth";
    }

    set.status = 401;
    return "Unauthorized";
  },
  {
    headers: t.Object({
      "root-key": t.Optional(t.String()),
    }),
  },
);
