import { command, option, string } from "cmd-ts";
import { getContext } from "../context.ts";
import { uploadRepo } from "../utils/uploadRepo.ts";

const stageFlag = option({
  type: string,
  long: "stage",
  defaultValue: () => "production",
  short: "s",
});

export const deploy = command({
  name: "deploy",
  args: { stageFlag },

  handler: async () => {
    const context = getContext();

    const presignedResponse = await context.request(`/storage/presigned`);
    if (!presignedResponse.ok) {
      throw new Error(
        `Failed to get presigned URL: ${presignedResponse.statusText}`,
      );
    }

    const { url, id } = (await presignedResponse.json()) as {
      url: string;
      id: string;
    };

    await uploadRepo({ url });

    const deployResponse = await context.request(`/deployments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        deploymentId: id,
      }),
    });

    if (!deployResponse.ok) {
      throw new Error(`Failed to deploy: ${deployResponse.statusText}`);
    }

    const reader = deployResponse.body?.getReader();
    if (!reader) {
      throw new Error("No response body");
    }

    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter((line) => line.trim());

      for (const line of lines) {
        try {
          const data = JSON.parse(line);

          if (data.type === "log") {
            console.log(data.message);
          } else if (data.type === "success") {
            console.log(data.message || "Deployment completed successfully");
            return;
          } else if (data.type === "error") {
            throw new Error(data.message || "Deployment failed");
          }
        } catch (error) {
          if (error instanceof SyntaxError) {
            // Skip invalid JSON lines
            continue;
          }
          // Re-throw deployment errors
          throw error;
        }
      }
    }
  },
});
