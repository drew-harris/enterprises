import { command, option, string } from "cmd-ts";
import { getContext } from "../context.ts";
import { uploadRepo } from "../utils/uploadRepo.ts";

const filenameFlag = option({
  type: string,
  long: "filename",
  defaultValue: () => `repo-${Date.now()}.tar.gz`,
  short: "f",
});

export const upload = command({
  name: "upload",
  args: { filenameFlag },
  description: "Upload current repository as tarball to S3",
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
