import type { PrismaClient } from "@prisma/client/edge";

export type Env = {
  DB: D1Database;
  BETTER_AUTH_SECRET: string;
  Env: string;
};

export type Database = PrismaClient;
