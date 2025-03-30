import Elysia from "elysia";
import { Client } from "minio";
import { base } from "../base";
import { auth } from "../auth";

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
    return { minio, env };
  })
  .get("/presigned", async ({ env, minio }) => {
    console.log("LOGGING THIS");
    const presigned = await minio.presignedPutObject(
      "enterprises",
      "test.txt",
      30,
    );
    return presigned.replace(
      "http://minio:9000/",
      `https://storage.${env.DOMAIN}/`,
    );
  });
