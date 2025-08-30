// biome-ignore-all lint/suspicious/noExplicitAny: lots of em
import type { Type } from "arktype";
import type { Result, ResultAsync } from "neverthrow";

type Success<T extends Result<any, any>> = T extends Result<infer U, any>
  ? U
  : never;

// TODO: actually validate with arktype!
export function syncFn<
  Arg1 extends Type,
  Callback extends (arg1: Arg1["infer"]) => Result<any, Error>,
>(arg1: Arg1, cb: Callback) {
  const result = (
    input: Arg1["inferIn"],
  ): Result<Success<ReturnType<Callback>>, Error> => cb(arg1.assert(input));
  result.schema = arg1;
  result.rawCb = cb;
  return result;
}

export function fn<
  Arg1 extends Type,
  Callback extends (arg1: Arg1["infer"]) => ResultAsync<any, Error>,
>(arg1: Arg1, cb: Callback) {
  const result = (
    input: Arg1["inferIn"],
  ): ResultAsync<Success<Awaited<ReturnType<Callback>>>, Error> =>
    cb(arg1.assert(input));
  result.schema = arg1;
  result.rawCb = cb;
  return result;
}
