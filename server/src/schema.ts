import { pgTable, text } from "drizzle-orm/pg-core";

export const TB_ApiKeys = pgTable("api_keys", {
  id: text("id").notNull(),
});
