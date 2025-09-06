import { type } from "arktype";
import { S3Client } from "bun";
import { Client } from "minio";
import { fromPromise, fromThrowable, type ResultAsync } from "neverthrow";
import { Env } from "../env";
import { ErrorWithStatus } from "../errors";
import { fn } from "../fn";
import { makeLogger } from "../logging";

export class StorageError extends ErrorWithStatus {}

export namespace Storage {
  const logger = makeLogger("storage");

  const s3Client = new S3Client({
    accessKeyId: Env.env.MINIO_ACCESS_KEY,
    secretAccessKey: Env.env.MINIO_SECRET_KEY,
    endpoint: `http://minio:9000`,
  });

  export function useS3Client<T>(callback: (client: S3Client) => Promise<T>) {
    return fromPromise(
      callback(s3Client),
      (e) =>
        new StorageError("Storage error", "Internal Server Error", {
          cause: e,
        }),
    );
  }

  export const assertFile = fn(
    type({
      filename: "string",
      bucket: "string",
    }),
    (input) => {
      logger.debug({ input }, "assertFile");
      return useS3Client((c) => {
        return c.exists(input.filename, {
          bucket: input.bucket,
        });
      });
    },
  );

  const createBucket = async () => {
    const minio = new Client({
      endPoint: "minio",
      port: 9000,
      accessKey: Env.env.MINIO_ACCESS_KEY,
      secretKey: Env.env.MINIO_SECRET_KEY,
      useSSL: false,
    });
    const exists = await minio.bucketExists("repos");
    if (!exists) {
      logger.info("creating bucket");
      await minio.makeBucket("repos");
    }
  };

  export const init = async () => {
    logger.info("setting up S3 storage");
    try {
      createBucket();
    } catch (_error) {
      logger.warn("S3 storage connection failed, but continuing");
    }
  };

  export const getPresignedPutObject = (
    key: string,
    expiry: number,
    bucket: string = "repos",
  ): ResultAsync<string, Error> => {
    logger.info({ key, expiry, bucket }, "getPresignedPutObject");

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

  export function downloadFile(args: {
    bucket: string;
    filename: string;
    destination: string;
  }): ResultAsync<void, Error> {
    const file = s3Client.file(args.filename, { bucket: args.bucket });
    logger.info(
      {
        filename: args.filename,
        destination: args.destination,
        bucket: args.bucket,
      },
      "downloadFile",
    );
    return fromPromise(
      (async () => {
        const data = await file.bytes();
        await Bun.write(args.destination, data, { createPath: true });
      })(),
      (e) => {
        console.error(e);
        return new Error("Failed to download file", {
          cause: e,
        });
      },
    );
  }
}
