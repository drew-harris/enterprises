import Elysia from "elysia";
import { auth } from "../auth";
import { unwrap } from "../errors";
import { Storage } from "../lib/storage";

export const storage = new Elysia({ prefix: "/storage" })
  .use(auth)
  .get("/presigned", () =>
    unwrap(
      Storage.getPresignedPutObject("text.txt", 300).map((r) => ({ url: r })),
    ),
  );
