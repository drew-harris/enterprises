import { lucia } from "lucia";
import { config } from "./config";
import { mysql2 } from "@lucia-auth/adapter-mysql";
import { pool } from "./db";

export const auth = lucia({
  env: config.NODE_ENV === "development" ? "DEV" : "PROD",
  adapter: mysql2(pool, {
    user: "users",
    session: "sessions",
    key: "user_key",
  }),
});

export type Auth = typeof auth;
