import type { DrizzleD1Database } from "drizzle-orm/d1";
import type * as schema from "./db/schema";

export type Env = {
  DB: D1Database;
  BETTER_AUTH_SECRET: string;
};

export type Database = DrizzleD1Database<typeof schema>;
