import type { Context, Next } from "hono";

import type { Env } from "../../types";
import { createAuthWithEnv } from "../../infrastructure/auth";

/**
 * BetterAuthインスタンスを設定するミドルウェア
 */
export const authMiddleware = async (
  c: Context<{
    Bindings: Env;
    Variables: {
      auth: ReturnType<typeof createAuthWithEnv>;
    };
  }>,
  next: Next,
) => {
  try {
    const auth = createAuthWithEnv(c.env);
    c.set("auth", auth);

    await next();
  } catch (error) {
    console.error("Authインスタンスの初期化エラー:", error);
    return new Response("Auth initialization error", { status: 500 });
  }
};
