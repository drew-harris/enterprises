import { type } from "arktype";
import { err, ok, type Result } from "neverthrow";
import { unwrap } from "../errors";
import { makeLogger } from "../logging";
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
    const fileExists = await unwrap(
      Storage.assertFile({
        bucket: "repos",
        filename: `${args.id}.tar.gz`,
      }),
    );

    yield { type: "log-message", message: "Uploading file" };

    if (!fileExists) {
      return err(new Error("File has not been uploaded"));
    }

    return ok(undefined);
  }
}
