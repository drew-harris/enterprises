import { env } from "@yolk-oss/elysia-env";
import Elysia, { t } from "elysia";

export const base = new Elysia().use(
  env({
    ROOT_KEY: t.String({
      minLength: 5,
      error: "Root Key Required!!",
    }),
    DOMAIN: t.String({
      description: "Main domain used for caddy",
      minLength: 5,
      error: "Domain Required!!",
    }),
    DISABLE_AUTH: t.BooleanString({
      description: "Disable all auth",
      minLength: 5,
      default: false,
    }),
  }),
);
