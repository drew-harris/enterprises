import { AsyncLocalStorage } from "node:async_hooks";
import {
  type InlineProgramArgs,
  LocalWorkspace,
} from "@pulumi/pulumi/automation";
import { type } from "arktype";
import type { DefineAppResult } from "enterprises/index";
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
    stage: type("string").default("production"),
  });

  const logger = makeLogger("deployments");

  export async function deploy(
    args: typeof DeployArgs.infer,
  ): Promise<unknown> {
    logger.info({ id: args.id }, `Deploying`);
    const fileExistsResult = await Storage.assertFile({
      bucket: "repos",
      filename: `${args.id}.tar.gz`,
    });

    const fileExists = fileExistsResult.match(
      (success) => success,
      (error) => {
        throw new Error(`error checking file exists: ${error}`);
      },
    );

    if (!fileExists) {
      throw new Error("File has not been uploaded");
    }

    clientLog("File uploaded successfully");

    const folderPath = `${Env.env.SANDBOX_PATH}/${args.id}`;

    // officially create the row
    await useTransaction((db) =>
      db.insert(tables.deployments).values({
        id: args.id,
        status: "pending",
      }),
    );

    await Storage.downloadFile({
      bucket: "repos",
      filename: `${args.id}.tar.gz`,
      destination: `${folderPath}.tar.gz`,
    });

    await Storage.extractFile({
      filename: `${folderPath}.tar.gz`,
      destination: `${folderPath}`,
    });

    // assert theres an enterprises.ts file in there
    const enterprisesFileExists = await Bun.file(`${folderPath}/enterprises.ts`)
      .exists()
      .catch((error) => {
        throw new Error("Couldn't get enterprises.ts file", { cause: error });
      });

    // copy the enterprises ts file into the local repo
    const file = Bun.file(`${folderPath}/enterprises.ts`);
    await Bun.write(`/app/server/loaded/${args.id}/enterprises.ts`, file);

    if (!enterprisesFileExists) {
      throw new Error("enterprises.ts file not found");
    }

    // try to run enterprises.ts
    logger.info("Running enterprises.ts");
    const module = await import(
      `/app/server/loaded/${args.id}/enterprises.ts`
    ).catch((error) => {
      throw new Error("Couldn't import enterprises.ts", { cause: error });
    });

    if (!module.app) {
      throw new Error("enterprises.ts file is not a valid app");
    }

    // attempt to run the default export function
    const app = (await module.app) as DefineAppResult;
    logger.info({ app }, "Got app result");

    const pulArgs: InlineProgramArgs = {
      projectName: app.args.name,
      program: async () => app.blueprint(app.args),
      stackName: args.stage,
    };
    const stack = await LocalWorkspace.createOrSelectStack(pulArgs);
    console.log(stack.info);
    // const upRes = await stack.up({ onOutput: console.info });

    clientLog("Deployment record created");

    return app;
  }
}
