import { AsyncLocalStorage } from "node:async_hooks";
import { type } from "arktype";
import { errAsync, okAsync, type Result } from "neverthrow";
import { tables, useTransaction } from "../db";
import { makeLogger } from "../logging";
import { Storage } from "./storage";

const deployContext = new AsyncLocalStorage<{
  log: (message: string) => void;
}>();

export function withDeployContext<T>(
  logFn: (message: string) => void,
  callback: () => Promise<T>,
): Promise<T> {
  return deployContext.run({ log: logFn }, callback);
}

export function clientLog(message: string): void {
  const context = deployContext.getStore();
  if (context?.log) {
    context.log(message);
  }
}

export namespace Deployments {
  const DeployArgs = type({
    id: "string",
    "stage?": "string",
  });

  const logger = makeLogger("deployments");

  export async function deploy(
    args: typeof DeployArgs.infer,
  ): Promise<Result<void, Error>> {
    logger.info({ id: args.id }, `Deploying`);
    const fileExists = await Storage.assertFile({
      bucket: "repos",
      filename: `${args.id}.tar.gz`,
    })
      .orTee((error) =>
        logger.error({ error: error }, "error checking file exists"),
      )
      .match(
        (r) => r,
        (_e) => false,
      );

    if (!fileExists) {
      return errAsync(new Error("File has not been uploaded"));
    }

    clientLog("File uploaded successfully");

    // officially create the row
    useTransaction((db) =>
      db.insert(tables.deployments).values({
        id: args.id,
        status: "pending",
      }),
    );

    // extract the files
    console.log("Extracting files");
    const _result = await Storage.downloadFile({
      bucket: "repos",
      filename: `${args.id}.tar.gz`,
      destination: `/tmp/${args.id}`,
    });

    clientLog("Deployment record created");

    return okAsync();
  }
}
