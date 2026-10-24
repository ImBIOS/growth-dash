import { createAuth } from "@bts-scaffold2/auth";
import { createDb } from "@bts-scaffold2/db";

import { ENV } from "./env.server";

export const db = createDb(ENV);
export const auth = createAuth(ENV, db);
