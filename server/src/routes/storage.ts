import Elysia from "elysia";
import { auth } from "../auth";
import { unwrap } from "../errors";
import { Storage } from "../lib/storage";

export const storage = new Elysia({ prefix: "/storage" })
  .use(auth)
  .get("/presigned", ({ query }) => {
    const filename = query.filename || "text.txt";
    return unwrap(
      Storage.getPresignedPutObject(filename, 300).map((r) => ({ url: r })),
    );
  });
