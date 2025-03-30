#!/usr/bin/env node

import { run, subcommands } from "cmd-ts";
import { deploy } from "./commands/deploy.ts";
import { ping } from "./commands/ping.ts";
import { runWithCliContext } from "./context.ts";

const program = subcommands({
  name: "enterprises",
  cmds: { deploy, ping },
  description: "Enterprises CLI",
  version: "0.0.1",
});

try {
  runWithCliContext(() => {
    run(program, process.argv.slice(2));
  });
} catch (error) {
  console.error(error);
  process.exit(1);
}
