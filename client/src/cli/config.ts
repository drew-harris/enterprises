import { type } from "arktype";

export const configSchema = type({
  serverHost: "string",
  rootKey: "string",
});

export type Config = typeof configSchema.infer;
