import type { Session } from "@bts-scaffold2/auth";
import type { Database } from "@bts-scaffold2/db";

export type Context = {
  session: Session | null;
  db: Database;
};
