import type { ExtractTablesWithRelations } from "drizzle-orm";
import { drizzle, type PostgresJsTransaction } from "drizzle-orm/postgres-js";
import { StatusMap } from "elysia";
import { fromPromise } from "neverthrow";
import postgres from "postgres";
import { createContext } from "./context";
import { Env } from "./env";
import { ErrorWithStatus } from "./errors";

export type Transaction = PostgresJsTransaction<
  Record<string, never>,
  ExtractTablesWithRelations<Record<string, never>>
>;

const queryClient = postgres(Env.env.DATABASE_URL, {
  onnotice: () => {},
});
export const db = drizzle(queryClient, { logger: false });

export type TxOrDb = Transaction | typeof queryClient;

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
      callback(queryClient),
      (e) =>
        new DatabaseError("Database error", "Internal Server Error", {
          cause: e,
        }),
    );
  }
}

export function useDb<T>(callback: (db: typeof queryClient) => Promise<T>) {
  return fromPromise(
    callback(queryClient),
    (e) =>
      new DatabaseError("Database error", "Internal Server Error", {
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
    const result = await db.transaction(async (tx) => {
      return TransactionContext.with({ tx, effects }, () => callback(tx));
    });
    await Promise.all(effects.map((x) => x()));
    return result as T;
  }
}
