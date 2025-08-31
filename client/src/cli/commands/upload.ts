import { command, option, string } from "cmd-ts";
import { getContext } from "../context.ts";
import { getTarballBuffer } from "../utils/createTar.ts";

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
  handler: async ({ filenameFlag: filename }) => {
    const context = getContext();

    console.log("Getting presigned URL...");
    const presignedResponse = await context.request(
      `/storage/presigned?filename=${encodeURIComponent(filename)}`,
    );
    if (!presignedResponse.ok) {
      throw new Error(
        `Failed to get presigned URL: ${presignedResponse.statusText}`,
      );
    }

    const { url } = await presignedResponse.json();
    console.log("Presigned URL obtained");

    console.log("Creating tarball...");
    const tarballBuffer = await getTarballBuffer();
    console.log(`Tarball created (${tarballBuffer.length} bytes)`);

    console.log("Uploading to S3...", url);
    const uploadResponse = await fetch(url, {
      method: "PUT",
      body: new Uint8Array(tarballBuffer),
      headers: {
        "Content-Type": "application/gzip",
      },
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.statusText}`);
    }

    const text = await uploadResponse.text();
    console.log(text);

    console.log(`Successfully uploaded ${filename} to S3`);
  },
});
