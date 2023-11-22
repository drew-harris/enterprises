import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const config = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z.enum(["development", "production"]).default("production"),
    LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  },

  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
