import Elysia, { t } from "elysia";
import { Client } from "minio";
import { base } from "../base";
import { auth } from "../auth";
import { fromPromise, ResultAsync } from "neverthrow";
import { unwrap } from "../errors";

export const storage = new Elysia({ prefix: "/storage" })
  .use(base)
  .use(auth)
  .decorate(({ env }) => {
    const minio = new Client({
      endPoint: "minio",
      port: 9000,
      accessKey: env.MINIO_ACCESS_KEY,
      secretKey: env.MINIO_SECRET_KEY,
      useSSL: false,
    });
    minio.bucketExists("enterprises").then((exists) => {
      if (!exists) {
        minio.makeBucket("enterprises");
      }
    });

    const useMinio = <T>(
      useFn: (db: typeof minio) => Promise<T>,
    ): ResultAsync<T, Error> => {
      const result = fromPromise(
        useFn(minio),
        (e) => new Error("Minio Error", { cause: e }),
      );
      return result;
    };

    return { useMinio, env };
  })
  .get(
    "/presigned",
    ({ env, useMinio }) =>
      unwrap(
        useMinio((m) => m.presignedPutObject("enterprises", "test.txt", 30))
          .map((r) =>
            r.replace("http://minio:9000/", `https://storage.${env.DOMAIN}/`),
          )
          .map((r) => ({ url: r })),
      ),
    {
      response: t.Object({
        url: t.String(),
      }),
    },
  );
