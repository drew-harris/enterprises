import Elysia, { t } from "elysia";
import { okAsync } from "neverthrow";
import { createTransaction } from "../db";
import { unwrap } from "../errors";
import { Deployments } from "../lib/deployments";

export const deployments = new Elysia({ prefix: "/deployments" }).post(
  "/",
  ({ body }) => {
    const result = createTransaction(() => {
      Deployments.deploy({
        id: body.deploymentId,
        stage: "prod",
      });
      return okAsync("hi");
    });

    return unwrap(result);
  },
  {
    body: t.Object({
      deploymentId: t.String(),
    }),
  },
);
