import { AsyncLocalStorage } from "node:async_hooks";
import fs from "node:fs/promises";
import { configSchema, type Config } from "./config.ts";

const contextStorage = new AsyncLocalStorage();

type RequestFn = (
  path: string,
  params?: Parameters<typeof fetch>[1],
) => ReturnType<typeof fetch>;

type Context = {
  config: Config;
  request: RequestFn;
};

const getConfig = async (): Promise<Config> => {
  const configFile = process.cwd() + "/enterprises.json";

  try {
    const fileContents = await fs.readFile(configFile);
    const config = JSON.parse(fileContents.toString());
    return configSchema.parse(config);
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      throw new Error(
        `Configuration file not found: ${configFile}. Please ensure the file exists.`,
      );
    }
    throw error;
  }
};

export const getContext = () => {
  return contextStorage.getStore() as Context;
};

export const runWithCliContext = async <T>(callback: () => T) => {
  const config = await getConfig();

  const request = (
    path: string,
    params: Parameters<typeof fetch>[1],
  ): ReturnType<typeof fetch> => {
    return fetch(`https://admin.${config.serverHost}${path}`, {
      ...params,
      headers: {
        ...params?.headers,
        "root-key": config.rootKey,
      },
    });
  };

  contextStorage.run({ config, request } satisfies Context, callback);
};
