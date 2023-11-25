import { lucia } from "lucia";
import { config } from "./config";
import { mysql2 } from "@lucia-auth/adapter-mysql";
import { github } from "@lucia-auth/oauth/providers";

import { pool } from "./db";
import { elysia } from "lucia/middleware";

export const auth = lucia({
  env: config.NODE_ENV === "development" ? "DEV" : "PROD",
  adapter: mysql2(pool, {
    user: "users",
    session: "sessions",
    key: "user_key",
  }),
  middleware: elysia(),
  sessionCookie: {
    expires: false,
  },

  getUserAttributes(dbUser) {
    return {
      username: dbUser.username,
    };
  },
});

export const githubAuth = github(auth, {
  clientId: config.GITHUB_CLIENT_ID,
  clientSecret: config.GITHUB_CLIENT_SECRET,
  redirectUri: config.GITHUB_REDIRECT_DOMAIN + "/auth/callback",
});

export type Auth = typeof auth;
