import { $ } from "bun";

await $`rm -rf dist`;
await $`bun tsc`;
await $`chmod +x dist/cli/index.js`;
