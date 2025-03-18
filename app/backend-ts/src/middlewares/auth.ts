import type { MiddlewareHandler } from "hono";
import { jwt } from "hono/jwt";

/**
 * JWT認証ミドルウェア
 */
export const authMiddleware: MiddlewareHandler = jwt({
  secret: process.env.JWT_SECRET || "fallback-secret",
});

/**
 * オプショナル認証ミドルウェア
 * Authorization ヘッダーがある場合のみJWT検証を行い、
 * ない場合や検証失敗時も処理を続行します
 */
export const optionalAuthMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (authHeader?.startsWith("Bearer ")) {
    try {
      const handler = jwt({
        secret: process.env.JWT_SECRET || "fallback-secret",
      });
      await handler(c, next);
      return;
    } catch (e) {
      // 認証失敗時は匿名ユーザーとして処理を続行
    }
  }

  // 認証ヘッダーがない場合や認証失敗時は処理を続行
  await next();
};
