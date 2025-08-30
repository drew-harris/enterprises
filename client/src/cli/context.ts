import * as nodeAsync_hooks from "node:async_hooks";
import fs from "node:fs/promises";
import { type Config, configSchema } from "./config.ts";

const contextStorage = new nodeAsync_hooks.AsyncLocalStorage();

type RequestFn = (
  path: string,
  params?: Parameters<typeof fetch>[1],
) => ReturnType<typeof fetch>;

type Context = {
  config: Config;
  request: RequestFn;
};

const getConfig = async (): Promise<Config> => {
  const configFile = `${process.cwd()}/enterprises.json`;

  try {
    const fileContents = await fs.readFile(configFile);
    const config = JSON.parse(fileContents.toString());
    return configSchema.assert(config);
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      console.error("Configuration file not found.");
      process.exit(1);
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
    return fetch(`${config.adminUrl}${path}`, {
      ...params,
      headers: {
        ...params?.headers,
        "root-key": config.rootKey,
      },
    });
  };

  contextStorage.run({ config, request }, callback);
};
