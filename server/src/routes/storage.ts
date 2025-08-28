import Elysia, { t } from "elysia";
import { auth } from "../auth";
import { base } from "../base";
import { unwrap } from "../errors";
import { Storage } from "../lib/storage";

export const storage = new Elysia({ prefix: "/storage" })
  .use(base)
  .use(auth)
  .get("/presigned", () =>
    unwrap(
      Storage.getPresignedPutObject("text.txt", 300).map((r) => ({ url: r })),
    ),
  );
