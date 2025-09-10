import { AsyncLocalStorage } from "node:async_hooks";
import { type } from "arktype";
import { errAsync, fromPromise, okAsync, type Result } from "neverthrow";
import { tables, useTransaction } from "../db";
import { Env } from "../env";
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
  ): Promise<Result<unknown, Error>> {
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

    const folderPath = `${Env.env.SANDBOX_PATH}/${args.id}`;

    // officially create the row
    const result = useTransaction((db) =>
      db.insert(tables.deployments).values({
        id: args.id,
        status: "pending",
      }),
    )
      .andThen(() => {
        return Storage.downloadFile({
          bucket: "repos",
          filename: `${args.id}.tar.gz`,
          destination: `${folderPath}.tar.gz`,
        });
      })
      .andThen(() =>
        Storage.extractFile({
          filename: `${folderPath}.tar.gz`,
          destination: `${folderPath}`,
        }),
      )
      // assert theres an enterprises.ts file in there
      .andThen(() => {
        return fromPromise(
          Bun.file(`${folderPath}/enterprises.ts`).exists(),
          (error) =>
            new Error("Couldn't get enterprises.ts file", { cause: error }),
        );
      })
      .andThen((r) => {
        if (!r) {
          return errAsync(new Error("enterprises.ts file not found"));
        }
        return okAsync(r);
      })
      // try to run enterprises.ts
      .andThen(() => {
        logger.info("Running enterprises.ts");
        return fromPromise(
          import(`${folderPath}/enterprises.ts`),
          (error) =>
            new Error("Couldn't import enterprises.ts", { cause: error }),
        );
      })
      // attempt to run the default export function
      .andThen((r) => {
        return fromPromise(
          r.default(),
          (error) => new Error("Couldn't run enterprises.ts", { cause: error }),
        );
      });

    clientLog("Deployment record created");

    return result;
  }
}
