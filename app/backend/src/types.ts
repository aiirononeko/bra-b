import type { PrismaClient } from "@prisma/client/edge";

export type Env = {
  DB: D1Database;
  BETTER_AUTH_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
};

export type Database = PrismaClient;
