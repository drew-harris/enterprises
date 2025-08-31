import { S3Client } from "bun";
import { Client } from "minio";
import { fromThrowable, type ResultAsync } from "neverthrow";
import { Env } from "../env";
import { makeLogger } from "../logging";

export namespace Storage {
  const log = makeLogger("storage");

  const s3Client = new S3Client({
    accessKeyId: Env.get("MINIO_ACCESS_KEY"),
    secretAccessKey: Env.get("MINIO_SECRET_KEY"),
    endpoint: `http://minio:9001`,
  });

  const createBucket = async () => {
    const minio = new Client({
      endPoint: "minio",
      port: 9000,
      accessKey: Env.get("MINIO_ACCESS_KEY"),
      secretKey: Env.get("MINIO_SECRET_KEY"),
      useSSL: false,
    });
    const exists = await minio.bucketExists("repos");
    if (!exists) {
      log.info("creating bucket");
      await minio.makeBucket("repos");
    }
  };

  export const init = async () => {
    log.info("setting up S3 storage");
    try {
      createBucket();
    } catch (_error) {
      log.warn("S3 storage connection failed, but continuing");
    }
  };

  export const getPresignedPutObject = (
    key: string,
    expiry: number,
    bucket: string = "repos",
  ): ResultAsync<string, Error> => {
    log.info({ key, expiry, bucket }, "getPresignedPutObject");

    const presignSync = fromThrowable(
      () =>
        s3Client.presign(key, {
          method: "PUT",
          expiresIn: expiry,
          endpoint: Env.env.DEV
            ? `http://storage.${Env.env.DOMAIN}`
            : `https://storage.${Env.env.DOMAIN}`,
          bucket,
        }),
      (e) => new Error("S3 Presign Error", { cause: e }),
    );

    return presignSync()
      .asyncMap((url) => Promise.resolve(url))
      .andTee((r) => console.log(r));
  };
}
