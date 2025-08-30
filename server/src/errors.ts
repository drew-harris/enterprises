import { StatusMap } from "elysia";
import type { ResultAsync } from "neverthrow";

export class ErrorWithStatus extends Error {
  constructor(
    message: string,
    public status: number | keyof StatusMap,
    { cause }: { cause?: Error | unknown } = {},
  ) {
    super(message, { cause });
  }
}

export const unwrap = async <T>(
  result: ResultAsync<T, Error>,
): Promise<Response | T> => {
  return new Promise((resolve) => {
    result.match(
      (value) => {
        resolve(value);
      },
      (error) => {
        let status = 500;
        if (error instanceof ErrorWithStatus) {
          if (typeof error.status === "number") {
            status = error.status;
          } else {
            status = StatusMap[error.status];
          }
        }
        resolve(
          new Response(JSON.stringify({ error: error.message }), {
            status,
            headers: { "Content-Type": "application/json" },
          }),
        );
      },
    );
  });
};
