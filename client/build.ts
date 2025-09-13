import { $ } from "bun";

await $`rm -rf dist/cli`;
await $`bun tsc`;
await $`chmod +x dist/cli/index.js`;
