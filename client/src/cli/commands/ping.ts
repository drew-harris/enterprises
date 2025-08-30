import { command } from "cmd-ts";
import { getContext } from "../context.ts";

export const ping = command({
  name: "ping",
  args: {},
  handler: async () => {
    const context = getContext();
    const response = await context.request("/ping");
    const text = await response.text();
    console.log(text);
  },
});
