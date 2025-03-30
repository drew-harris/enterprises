import { command, option, string } from "cmd-ts";

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
    console.log(`Deploying to ${stageFlag}`);
  },
});
