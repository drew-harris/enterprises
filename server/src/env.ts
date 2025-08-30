import { type } from "arktype";

export namespace Env {
  export const envSchema = type({
    ROOT_KEY: "string",
    DOMAIN: "string",
    DATABASE_URL: "string",
    DISABLE_AUTH: type("string").pipe((input: unknown) => {
      if (input === "true") {
        return true;
      }
      if (input === "false") {
        return false;
      }
      throw new Error("Invalid boolean");
    }),
    MINIO_ACCESS_KEY: "string",
    MINIO_SECRET_KEY: "string",
    DEV: type("string").pipe((input: unknown) => {
      if (!input) {
        return false;
      }
      if (input === "true") {
        return true;
      }
      if (input === "false") {
        return false;
      }
    }),
  });

  export const env = (() => {
    const env = envSchema(process.env);
    if (env instanceof type.errors) {
      console.error(env.map((x) => x.message).join("\n"));
      process.exit(1);
    }
    return env;
  })();

  export const get = <T extends keyof typeof envSchema.infer>(key: T) => {
    return env[key];
  };
}
