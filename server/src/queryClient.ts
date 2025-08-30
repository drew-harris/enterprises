import postgres from "postgres";
import { Env } from "./env";

export const queryClient = postgres(Env.env.DATABASE_URL, {
  onnotice: () => {},
});
