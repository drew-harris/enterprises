import { type } from "arktype";

export const configSchema = type({
  adminUrl: "string",
  rootKey: "string",
});

export type Config = typeof configSchema.infer;
