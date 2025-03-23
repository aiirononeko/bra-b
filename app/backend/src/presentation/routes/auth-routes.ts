import { buildHono, errThrowHelper } from "../common";
import { authMiddleware, optionalAuthMiddleware } from "../middlewares/auth";
import type { AuthUser } from "../middlewares/auth";

/**
 * 認証関連のルーティング
 *
 * ユーザー認証と認可に関連する機能を提供するエンドポイント
 */
const app = buildHono();

/**
 * 現在のユーザー情報を取得
 *
 * GET /auth/me
 * @returns 認証済みユーザーの情報
 */
app.get("/me", authMiddleware, async (c) => {
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
    return c.json(
      {
        success: false,
        message: "ユーザー情報の取得に失敗しました",
      },
      401,
    );
  }
});

/**
 * ユーザー認証状態を確認
 *
 * GET /auth/status
 * 認証ユーザーのみアクセス可能なルートをチェックする際に使用
 *
 * @returns 認証状態（authenticated:true/false）と不要な場合はユーザー情報
 */
app.get("/status", optionalAuthMiddleware, async (c) => {
  try {
    const user = c.get("user");
    const isAuthenticated = !!user;

    return c.json({
      success: true,
      authenticated: isAuthenticated,
      // オプショナル：includeUserパラメータが指定されている場合のみユーザー情報を含める
      ...(c.req.query("includeUser") === "true" && isAuthenticated ? { user } : {}),
    });
  } catch (error) {
    console.error("認証状態確認エラー:", error);
    return c.json(
      {
        success: false,
        authenticated: false,
        message: "認証状態の確認中にエラーが発生しました",
      },
      500,
    );
  }
});

/**
 * ユーザープロフィール更新
 *
 * PATCH /auth/profile
 * 認証済みユーザーのプロフィール情報を更新
 *
 * @body 更新するプロフィール情報（名前など）
 * @returns 更新後のユーザー情報
 */
app.patch("/profile", authMiddleware, async (c) => {
  try {
    const user = c.get("user") as AuthUser;
    const authInstance = c.get("auth");
    const body = await c.req.json();

    // 更新可能なフィールドを制限（セキュリティ対策）
    const allowedFields = ["name", "avatar"];
    const updateData = Object.keys(body)
      .filter((key) => allowedFields.includes(key))
      .reduce(
        (obj, key) => {
          obj[key] = body[key];
          return obj;
        },
        {} as Record<string, unknown>,
      );

    // 更新するデータがない場合
    if (Object.keys(updateData).length === 0) {
      return c.json(
        {
          success: false,
          message: "更新可能なフィールドが指定されていません",
        },
        400,
      );
    }

    // better-authにユーザー更新APIがない場合は独自実装が必要
    // この例ではAPIが存在すると仮定して実装
    if (!authInstance?.api?.updateUser) {
      throw errThrowHelper(501, "ユーザープロフィール更新機能は未実装です");
    }

    // @ts-ignore - BetterAuthの型定義が不完全なため
    const result = await authInstance.api.updateUser({
      id: user.id,
      data: updateData,
    });

    // 更新結果を返す
    return c.json({
      success: true,
      user: result.data,
    });
  } catch (error) {
    console.error("プロフィール更新エラー:", error);
    if (error instanceof Error) {
      return c.json(
        {
          success: false,
          message: `プロフィールの更新に失敗しました: ${error.message}`,
        },
        500,
      );
    }
    return c.json(
      {
        success: false,
        message: "プロフィールの更新に失敗しました",
      },
      500,
    );
  }
});

/**
 * パスワード変更
 *
 * POST /auth/change-password
 * 認証済みユーザーのパスワードを変更
 *
 * @body 現在のパスワードと新しいパスワード
 * @returns 成功メッセージまたはエラー
 */
app.post("/change-password", authMiddleware, async (c) => {
  try {
    const user = c.get("user") as AuthUser;
    const authInstance = c.get("auth");
    const { currentPassword, newPassword } = await c.req.json();

    // 入力バリデーション
    if (!currentPassword || !newPassword) {
      return c.json(
        {
          success: false,
          message: "現在のパスワードと新しいパスワードが必要です",
        },
        400,
      );
    }

    if (newPassword.length < 8) {
      return c.json(
        {
          success: false,
          message: "新しいパスワードは8文字以上である必要があります",
        },
        400,
      );
    }

    // better-authにパスワード変更APIがない場合は独自実装が必要
    // この例ではAPIが存在すると仮定して実装
    if (!authInstance?.api?.changePassword) {
      throw errThrowHelper(501, "パスワード変更機能は未実装です");
    }

    // @ts-ignore - BetterAuthの型定義が不完全なため
    const result = await authInstance.api.changePassword({
      userId: user.id,
      currentPassword,
      newPassword,
    });

    if (!result.success) {
      return c.json(
        {
          success: false,
          message: result.error || "パスワードの変更に失敗しました",
        },
        400,
      );
    }

    return c.json({
      success: true,
      message: "パスワードが正常に変更されました",
    });
  } catch (error) {
    console.error("パスワード変更エラー:", error);
    if (error instanceof Error) {
      return c.json(
        {
          success: false,
          message: `パスワードの変更に失敗しました: ${error.message}`,
        },
        500,
      );
    }
    return c.json(
      {
        success: false,
        message: "パスワードの変更に失敗しました",
      },
      500,
    );
  }
});

/**
 * ログアウト（セッション終了）
 *
 * POST /auth/logout
 * 現在のセッションを終了する
 *
 * @returns 成功メッセージまたはエラー
 */
app.post("/logout", optionalAuthMiddleware, async (c) => {
  try {
    const authInstance = c.get("auth");

    if (!authInstance?.api?.signOut) {
      throw errThrowHelper(501, "ログアウト機能は未実装です");
    }

    // @ts-ignore - BetterAuthの型定義が不完全なため
    await authInstance.api.signOut({
      headers: c.req.raw.headers,
    });

    return c.json({
      success: true,
      message: "ログアウトしました",
    });
  } catch (error) {
    console.error("ログアウトエラー:", error);
    if (error instanceof Error) {
      return c.json(
        {
          success: false,
          message: `ログアウトに失敗しました: ${error.message}`,
        },
        500,
      );
    }
    return c.json(
      {
        success: false,
        message: "ログアウトに失敗しました",
      },
      500,
    );
  }
});

export default app;
