import { CommandError } from "@pulumi/pulumi/automation";
import { $ } from "bun";
import { fromPromise } from "neverthrow";
import { makeLogger } from "../logging";

export namespace Pulumi {
  const logger = makeLogger("Pulumi");

  export const install = () => {
    return fromPromise(
      $`
      pulumi login "s3://pulumi-data?endpoint=minio:9000&disableSSL=true&s3ForcePathStyle=true"
      `.env({
        AWS_ACCESS_KEY_ID: "minioadmin",
        AWS_SECRET_ACCESS_KEY: "minioadmin",
        AWS_DEFAULT_REGION: "us-west-2",
      }),
      (e) => {
        return new Error("Pulumi install failed", { cause: e });
      },
    ).andTee((cmdResult) => {
      logger.info(cmdResult.text());
    });
  };
}
