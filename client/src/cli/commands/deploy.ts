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

    const { url } = (await presignedResponse.json()) as {
      url: string;
      id: string;
    };

    uploadRepo({ url });
  },
});
