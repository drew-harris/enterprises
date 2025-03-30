import { z } from "zod";

export const configSchema = z.object({
  serverHost: z.string(),
  rootKey: z.string(),
});

export type Config = z.infer<typeof configSchema>;
