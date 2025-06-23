import { StatusMap } from "elysia";

export class ErrorWithStatus extends Error {
  constructor(
    message: string,
    public status: number | keyof StatusMap,
  ) {
    super(message);
  }
}
