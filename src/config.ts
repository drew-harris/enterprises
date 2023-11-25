import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const config = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z.enum(["development", "production"]).default("production"),
    LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
    GITHUB_CLIENT_ID: z.string(),
    GITHUB_CLIENT_SECRET: z.string(),
    GITHUB_REDIRECT_DOMAIN: z.string().url(),
  },

  runtimeEnv: {
    ...process.env,
  },
  emptyStringAsUndefined: true,
});
