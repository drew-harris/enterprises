import Elysia, { t } from "elysia";
import { base } from "./base";

export const auth = new Elysia({ prefix: "/auth" }).use(base).get(
  "/forward",
  ({ env, headers, set }) => {
    if (env.DISABLE_AUTH) {
      return "Working auth";
    }
    if (headers["root-key"] && headers["root-key"] === env.ROOT_KEY) {
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
