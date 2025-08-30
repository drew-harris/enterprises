import { command } from "cmd-ts";
import { getContext } from "../context.ts";

export const ping = command({
  name: "ping",
  args: {},
  handler: async () => {
    const _context = getContext();
  },
});
