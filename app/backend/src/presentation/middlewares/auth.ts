import type { Context, Next } from "hono";

import { auth } from "../../auth";
import { errThrowHelper } from "../common";
import type { Env } from "../../types";
import type { Database } from "../../types";

// ユーザーとセッションの型を定義
type AuthUser = {
  id: string;
  email?: string;
  name?: string;
  [key: string]: unknown;
};

type AuthSession = {
  id: string;
  userId: string;
  expiresAt: Date | string;
  [key: string]: unknown;
};

/**
 * 認証ミドルウェア
 * BetterAuthを使用してセッションを検証
 */
export const authMiddleware = async (
  c: Context<{
    Bindings: Env;
    Variables: { db: Database; user?: AuthUser; session?: AuthSession };
  }>,
  next: Next,
) => {
  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session) {
      throw errThrowHelper(401, "認証が必要です");
    }

    // // ユーザー情報をコンテキストに設定
    // c.set("user", session.user);
    // c.set("session", session.session);

    await next();
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    throw errThrowHelper(401, "認証エラー");
  }
};
