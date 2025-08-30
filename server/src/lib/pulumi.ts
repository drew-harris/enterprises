import { PulumiCommand } from "@pulumi/pulumi/automation";

export namespace Pulumi {
  const _test = PulumiCommand.install();
}
