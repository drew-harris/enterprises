import { getTarballBuffer } from "./createTar.ts";

export const uploadRepo = async ({ url }: { url: string }) => {
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
};
