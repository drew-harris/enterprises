import Elysia, { t } from "elysia";
import { createTransaction, tables, useDb } from "../db";
import { unwrap } from "../errors";
import { Deployments, withDeployContext } from "../lib/deployments";
import { makeLogger } from "../logging";

const logger = makeLogger("deploymentRoute");

export const deployments = new Elysia({ prefix: "/deployments" })
  .get("/", () => {
    const result = unwrap(useDb((db) => db.select().from(tables.deployments)));
    return result;
  })
  .post(
    "/",
    async ({ body, set }) => {
      set.headers["Content-Type"] = "application/x-ndjson";
      set.headers["Cache-Control"] = "no-cache";
      set.headers.Connection = "keep-alive";

      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();

          const sendMessage = (type: string, message?: string) => {
            const data = message ? { type, message } : { type };
            controller.enqueue(encoder.encode(`${JSON.stringify(data)}\n`));
          };

          try {
            await withDeployContext(
              (message) => sendMessage("log", message),
              async () => {
                const result = await createTransaction(async () => {
                  const result = await Deployments.deploy({
                    id: body.deploymentId,
                    stage: "prod",
                  });
                  return result;
                });

                if (result.isErr()) {
                  useDb((db) =>
                    db
                      .insert(tables.deployments)
                      .values({
                        status: "error",
                        id: body.deploymentId,
                      })
                      .onConflictDoUpdate({
                        target: tables.deployments.id,
                        set: {
                          status: "error",
                        },
                      }),
                  );

                  logger.error(result.error);
                  sendMessage("error", result.error.message);
                } else {
                  useDb((db) =>
                    db
                      .insert(tables.deployments)
                      .values({
                        status: "success",
                        id: body.deploymentId,
                      })
                      .onConflictDoUpdate({
                        target: tables.deployments.id,
                        set: {
                          status: "success",
                        },
                      }),
                  );

                  logger.info("Deployment completed successfully");
                  sendMessage("success", "Deployment completed");
                }
              },
            );
          } catch (error) {
            logger.error(error);
            sendMessage(
              "error",
              error instanceof Error ? error.message : "Unknown error",
            );
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream);
    },
    {
      body: t.Object({
        deploymentId: t.String(),
      }),
    },
  );
