import { buildHono } from "../common";

/**
 * 認証関連のルーティング
 *
 */
const app = buildHono()
  /**
   * ログインユーザー情報取得
   *
   * GET /auth/me
   * @returns ログインユーザー情報
   */
  .get("/me", async (c) => {
    try {
      const user = c.get("user");

      return c.json({
        success: true,
        user,
      });
    } catch (error) {
      console.error("ユーザー情報取得エラー:", error);
      if (error instanceof Error) {
        return c.json(
          {
            success: false,
            message: error.message,
          },
          401,
        );
      }
      return c.json({ success: false, message: "ユーザー情報取得に失敗しました" }, 401);
    }
  });

export default app;
