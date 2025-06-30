import { Client } from "minio";
import { Env } from "../env";
import { fromPromise, ResultAsync } from "neverthrow";
import { makeLogger } from "../logging";

export namespace Storage {
  const log = makeLogger("storage");

  const minio = new Client({
    endPoint: "minio",
    port: 9000,
    accessKey: Env.get("MINIO_ACCESS_KEY"),
    secretKey: Env.get("MINIO_SECRET_KEY"),
    useSSL: false,
  });

  export const init = async () => {
    log.info("setting up minio");
    const exists = await minio.bucketExists("enterprises");
    if (!exists) {
      log.info("creating bucket");
      await minio.makeBucket("enterprises");
    }
  };

  const useMinio = <T>(
    useFn: (db: typeof minio) => Promise<T>,
  ): ResultAsync<T, Error> => {
    const result = fromPromise(
      useFn(minio),
      (e) => new Error("Minio Error", { cause: e }),
    );
    return result;
  };

  export const getPresignedPutObject = (
    key: string,
    expiry: number,
    bucket: string = "enterprises",
  ): ResultAsync<string, Error> => {
    log.info({ key, expiry, bucket }, "getPresignedPutObject");

    return useMinio((m) => m.presignedPutObject(bucket, key, expiry)).map((r) =>
      r.replace("http://minio:9000/", `https://storage.${Env.get("DOMAIN")}/`),
    );
  };
}
