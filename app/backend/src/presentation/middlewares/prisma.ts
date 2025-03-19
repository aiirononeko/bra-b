import type { Context, Next } from "hono";

import { getPrismaClient } from "../../infrastructure/prisma";
import type { Env } from "../../types";

/**
 * Prismaクライアントを設定するミドルウェア
 * - 開発環境：標準のPrismaクライアントを使用
 * - 本番環境：D1アダプターを使用したPrismaクライアントを使用
 */
export const prismaMiddleware = async (
  c: Context<{
    Bindings: Env;
    Variables: { db: ReturnType<typeof getPrismaClient> };
  }>,
  next: Next,
) => {
  try {
    // 環境に合わせて適切なPrismaクライアントを取得
    const prismaClient = getPrismaClient(c.env);
    c.set("db", prismaClient);
    await next();
  } catch (error) {
    console.error("Prismaクライアントの初期化エラー:", error);
    return new Response("Database initialization error", { status: 500 });
  }
};
