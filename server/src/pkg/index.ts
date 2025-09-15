export const pkgName = "drew";

export * as Minio from "@pulumi/minio";

export const database = (name: string, password: string) => {
  console.log("making the database");
  return `jdbc:mysql://localhost:3306/${name}?user=${name}&password=${password}`;
};

type AppArgs = {
  name: string;
};

export const defineApp = (
  args: AppArgs,
  blueprint: (ctx: AppArgs) => Promise<void>,
) => {
  return {
    args,
    blueprint,
  };
};

export type DefineAppResult = ReturnType<typeof defineApp>;
