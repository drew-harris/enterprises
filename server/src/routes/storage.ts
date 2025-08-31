import Elysia from "elysia";
import { auth } from "../auth";
import { unwrap } from "../errors";
import { createId } from "../ids";
import { Storage } from "../lib/storage";

export const storage = new Elysia({ prefix: "/storage" })
  .use(auth)
  .get("/presigned", () => {
    const deploymentId = createId("deployments");

    return unwrap(
      Storage.getPresignedPutObject(`${deploymentId}.tar.gz`, 300).map((r) => ({
        url: r,
        id: deploymentId,
      })),
    );
  });
