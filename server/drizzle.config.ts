import { defineConfig } from "drizzle-kit";
export default defineConfig({
  dialect: "postgresql",
  dbCredentials: {
    // biome-ignore lint/style/noNonNullAssertion: its a config
    url: process.env.DATABASE_URL!,
  },
  schema: "./src/schema.ts",
  out: "./drizzle",
});
