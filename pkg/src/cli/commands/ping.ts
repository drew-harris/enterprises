import { command, option, string } from "cmd-ts";
import { getContext } from "../context.ts";

export const ping = command({
  name: "ping",
  args: {},
  handler: async ({}) => {
    const context = getContext();
  },
});
