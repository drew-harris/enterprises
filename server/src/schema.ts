import { pgTable, text } from "drizzle-orm/pg-core";

export const apiKeys = pgTable("api_keys", {
  id: text("id").notNull(),
});

export const deployments = pgTable("deployments", {
  id: text("id").notNull(),
  status: text("status")
    .$type<"pending" | "error" | "success">()
    .default("pending"),
});
