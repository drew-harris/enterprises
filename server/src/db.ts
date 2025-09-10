import type { ExtractTablesWithRelations } from "drizzle-orm";
import { type BunSQLTransaction, drizzle } from "drizzle-orm/bun-sql";
import { StatusMap } from "elysia";
import { fromPromise, type ResultAsync } from "neverthrow";
import { createContext } from "./context";
import { Env } from "./env";
import { ErrorWithStatus } from "./errors";

export * as tables from "../src/schema";

export type Transaction = BunSQLTransaction<
  Record<string, never>,
  ExtractTablesWithRelations<Record<string, never>>
>;

export const rawDb = drizzle(Env.env.DATABASE_URL, { logger: false });

export type TxOrDb = Transaction | typeof rawDb;

const TransactionContext = createContext<{
  tx: Transaction;
  effects: (() => void | Promise<void>)[];
}>();

export class DatabaseError extends ErrorWithStatus {}

export function useTransaction<T>(callback: (trx: TxOrDb) => Promise<T>) {
  try {
    const { tx } = TransactionContext.use();
    return fromPromise(
      callback(tx),
      (e) =>
        new DatabaseError(
          "Database Error",
          StatusMap["Internal Server Error"],
          { cause: e },
        ),
    );
  } catch {
    return fromPromise(
      callback(rawDb),
      (e) =>
        new DatabaseError(
          "Database error",
          StatusMap["Internal Server Error"],
          {
            cause: e,
          },
        ),
    );
  }
}

export function useDb<T>(
  callback: (db: typeof rawDb) => Promise<T>,
): ResultAsync<T, Error> {
  return fromPromise(
    callback(rawDb),
    (e) =>
      new DatabaseError("Database error", StatusMap["Internal Server Error"], {
        cause: e,
      }),
  );
}

export async function afterTx(effect: () => void | Promise<void>) {
  try {
    const { effects } = TransactionContext.use();
    effects.push(effect);
  } catch {
    await effect();
  }
}

export async function createTransaction<T>(
  callback: (tx: Transaction) => Promise<T>,
): Promise<T> {
  try {
    const { tx } = TransactionContext.use();
    return callback(tx);
  } catch {
    const effects: (() => void | Promise<void>)[] = [];
    const result = await rawDb.transaction(async (tx) => {
      return TransactionContext.with({ tx, effects }, () => callback(tx));
    });
    await Promise.all(effects.map((x) => x()));
    return result;
  }
}
