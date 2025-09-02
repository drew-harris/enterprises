import Elysia, { t } from "elysia";
import { Deployments } from "../lib/deployments";

export const deployments = new Elysia({ prefix: "/deployments" }).post(
  "/",
  async ({ body, set }) => {
    set.headers["Content-Type"] = "application/x-ndjson";
    set.headers["Cache-Control"] = "no-cache";
    set.headers.Connection = "keep-alive";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const generator = Deployments.deploy({
            id: body.deploymentId,
            stage: "prod",
          });

          for await (const result of generator) {
            if (
              typeof result === "object" &&
              "type" in result &&
              result.type === "log-message"
            ) {
              const line = `${JSON.stringify(result)}\n`;
              controller.enqueue(new TextEncoder().encode(line));
            } else if (
              typeof result === "object" &&
              "isErr" in result &&
              result.isErr()
            ) {
              const errorLine = `${JSON.stringify({
                type: "error",
                message: result.error.message,
              })}\n`;
              controller.enqueue(new TextEncoder().encode(errorLine));
              break;
            } else if (
              typeof result === "object" &&
              "isOk" in result &&
              result.isOk()
            ) {
              const successLine = `${JSON.stringify({
                type: "success",
                message: "Deployment completed",
              })}\n`;
              controller.enqueue(new TextEncoder().encode(successLine));
              break;
            }
          }
        } catch (error) {
          const errorLine = `${JSON.stringify({
            type: "error",
            message: error instanceof Error ? error.message : "Unknown error",
          })}\n`;
          controller.enqueue(new TextEncoder().encode(errorLine));
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
