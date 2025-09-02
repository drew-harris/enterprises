import { type } from "arktype";
import { err, ok, type Result } from "neverthrow";
import { useTransaction } from "../db";
import { makeLogger } from "../logging";
import { TB_ApiKeys } from "../schema";
import { Storage } from "./storage";

export namespace Deployments {
  const _logger = makeLogger("deployments");

  const DeployArgs = type({
    id: "string",
    "stage?": "string",
  });

  type DeployResultValue =
    | { type: "log-message"; message: string }
    | Result<undefined, Error>;

  export async function* deploy(
    args: typeof DeployArgs.infer,
  ): AsyncGenerator<DeployResultValue> {
    const fileExists = await Storage.assertFile({
      bucket: "repos",
      filename: `${args.id}.tar.gz`,
    }).match(
      (r) => r,
      (_e) => false,
    );

    // officially create the row
    useTransaction((db) =>
      db.insert(TB_ApiKeys).values({
        id: args.id,
      }),
    );

    if (!fileExists) {
      return err(new Error("File has not been uploaded"));
    }

    yield { type: "log-message", message: "Uploaded file" };

    return ok(undefined);
  }
}
