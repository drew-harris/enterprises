#!/usr/bin/env node

import { run, subcommands } from "cmd-ts";
import { deploy } from "./commands/deploy.ts";

const program = subcommands({
  name: "enterprises",
  cmds: { deploy },
});

run(program, process.argv.slice(2));
