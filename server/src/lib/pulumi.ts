import { LocalWorkspace, PulumiCommand } from "@pulumi/pulumi/automation";

export namespace Pulumi {
  const test = PulumiCommand.install();
}
