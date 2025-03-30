import { command, option, string } from "cmd-ts";
import { getContext } from "../context.ts";

const stageFlag = option({
  type: string,
  long: "stage",
  defaultValue: () => "production",
  short: "s",
});

export const deploy = command({
  name: "deplo",
  args: { stageFlag },

  handler: async ({ stageFlag }) => {
    const context = getContext();
    const response = await context.request("/storage/presigned");
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    console.log(await response.text());
  },
});
