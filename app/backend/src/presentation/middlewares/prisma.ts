import type { Context, Next } from "hono";

import type { Env } from "../../types";
import { getPrismaClient } from "../../infrastructure/prisma/client";

/**
 * Prismaクライアントを設定するミドルウェア
 */
export const prismaMiddleware = async (
  c: Context<{
    Bindings: Env;
    Variables: { db: Awaited<ReturnType<typeof getPrismaClient>> };
  }>,
  next: Next,
) => {
  try {
    const prismaClient = getPrismaClient(c.env);
    c.set("db", prismaClient);

    await next();
  } catch (error) {
    console.error("Prismaクライアントの初期化エラー:", error);
    return new Response("Database initialization error", { status: 500 });
  }
};
