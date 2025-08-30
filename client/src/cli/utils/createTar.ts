import * as fs from "node:fs";
import { PassThrough } from "node:stream";
import { glob } from "glob";
import ignore from "ignore";
import * as tar from "tar";

export async function getTarballBuffer(): Promise<Buffer> {
  const ig = ignore().add(".git");
  if (fs.existsSync(".gitignore")) {
    ig.add(fs.readFileSync(".gitignore", "utf-8"));
  } else {
    console.warn("No .gitignore found!");
  }

  // Get files
  const files = (await glob("**/*", { dot: true, nodir: true })).filter(
    (f) => !ig.ignores(f),
  );

  // Stream to buffer
  const chunks: Buffer[] = [];
  const stream = new PassThrough();
  stream.on("data", (chunk) => chunks.push(chunk));

  await new Promise<void>((resolve, reject) => {
    tar
      .create({ gzip: true }, files)
      .pipe(stream)
      .on("finish", resolve)
      .on("error", reject);
  });

  return Buffer.concat(chunks);
}
