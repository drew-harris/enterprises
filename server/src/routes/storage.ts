import Elysia, { t } from "elysia";
import { Storage } from "../lib/storage";
import { base } from "../base";
import { auth } from "../auth";
import { unwrap } from "../errors";

export const storage = new Elysia({ prefix: "/storage" })
  .use(base)
  .use(auth)
  .get("/presigned", () =>
    unwrap(
      Storage.getPresignedPutObject("text.txt", 300).map((r) => ({ url: r })),
    ),
  );
