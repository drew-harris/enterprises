import { CommandError, PulumiCommand } from "@pulumi/pulumi/automation";
import { fromPromise } from "neverthrow";
import { makeLogger } from "../logging";

export namespace Pulumi {
  const logger = makeLogger("pulumi");

  export const install = () => {
    return fromPromise(PulumiCommand.install(), (e) => {
      if (e instanceof CommandError) {
        return e;
      }
      return new CommandError("Error installing pulumi", { cause: e });
    })
      .orTee((err) => logger.error(err))
      .andTee((result) =>
        logger.info({ version: result.version?.raw }, "installed pulumi"),
      );
  };
}
