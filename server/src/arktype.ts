import type { Type } from "arktype";
import { err, ok, type Result } from "neverthrow";

export const parseToResult = <T extends Type>(
  schema: T,
  value: unknown,
): Result<T["infer"], Error> => {
  try {
    return ok(schema.assert(value));
  } catch (error) {
    return err(new Error(`Failed to parse${error}`));
  }
};
