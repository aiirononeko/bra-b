import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { Hono } from "hono";
import type { Context } from "hono";
import authRoutes from "../../src/presentation/routes/auth-routes";
import { errThrowHelper } from "../../src/presentation/common";
import type { AuthUser, AuthSession } from "../../src/presentation/middlewares/auth";
import type { Env } from "../../src/types";

// HonoのContext拡張型
interface TestVariables {
  db?: unknown;
  user?: AuthUser;
  session?: AuthSession;
  auth?: unknown;
  __skipAuth?: boolean;
  __userSet?: boolean;
  __user?: AuthUser;
  __session?: AuthSession;
  [key: string]: unknown;
}

// テスト用のHono型
type TestHono = Hono<{
  Variables: TestVariables;
}>;

// テスト用のContext型
type TestContext = Context<{
  Variables: TestVariables;
}>;

// authMiddlewareのモック
vi.mock("../../src/presentation/middlewares/auth", () => {
  return {
    authMiddleware: vi.fn(async (c, next) => {
      // テスト用のユーザー情報を設定
      if (c.__skipAuth) {
        throw errThrowHelper(401, "認証エラー: テスト用の強制エラー");
      }

      if (!c.__userSet) {
        c.set("user", {
          id: "test-user-id",
          email: "test@example.com",
          name: "テストユーザー",
        });
        c.__userSet = true;
      }

      return next();
    }),
    optionalAuthMiddleware: vi.fn(async (c, next) => {
      // オプションの認証ミドルウェア：ユーザー情報が指定されていれば設定
      if (c.__user) {
        c.set("user", c.__user);

        if (c.__session) {
          c.set("session", c.__session);
        }
      }

      return next();
    }),
  };
});

// エラーヘルパーのモック
vi.mock("../../src/presentation/common", () => {
  return {
    buildHono: () => new Hono(),
    errThrowHelper: vi.fn((status, message) => {
      return new Error(`${status}: ${message}`);
    }),
  };
});

describe("認証ルートのテスト", () => {
  // テスト用の有効なユーザーとセッション
  const validUser: AuthUser = {
    id: "test-user-id",
    email: "test@example.com",
    name: "テストユーザー",
  };

  const validSession: AuthSession = {
    id: "test-session-id",
    userId: "test-user-id",
    expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1時間後
  };

  let app: TestHono;
  let mockAuthInstance: {
    api: {
      signOut: ReturnType<typeof vi.fn>;
      updateUser: ReturnType<typeof vi.fn>;
      changePassword: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    // 各テスト前にモックをリセット
    vi.clearAllMocks();

    // APIモックを作成
    mockAuthInstance = {
      api: {
        signOut: vi.fn().mockResolvedValue({}),
        updateUser: vi.fn().mockResolvedValue({
          data: {
            ...validUser,
            name: "更新されたユーザー名",
          },
        }),
        changePassword: vi.fn().mockResolvedValue({
          success: true,
        }),
      },
    };

    // アプリケーションの初期化（型キャストでエラーを回避）
    app = authRoutes as unknown as TestHono;

    // テスト用の設定を追加
    app.use("*", async (c: any, next) => {
      c.set("auth", mockAuthInstance);
      await next();
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("GET /auth/me", () => {
    it("認証済みユーザーの情報を返すこと", async () => {
      // リクエストを作成してレスポンスを取得
      const res = await app.request("/me", {
        method: "GET",
      });

      // レスポンスのステータスとJSONを確認
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data).toEqual({
        success: true,
        user: validUser,
      });
    });

    it("認証エラー時には401エラーを返すこと", async () => {
      // 認証エラーを発生させるフラグを設定
      app.use("/me", async (c: any, next) => {
        c.__skipAuth = true;
        await next();
      });

      // リクエストを作成してレスポンスを取得
      const res = await app.request("/me", {
        method: "GET",
      });

      // 401エラーが返されることを確認
      expect(res.status).toBe(401);

      const data = await res.json();
      expect(data.success).toBe(false);
    });
  });

  describe("GET /auth/status", () => {
    it("認証済みの場合はauthenticated:trueを返すこと", async () => {
      // ユーザー情報を設定
      app.use("/status", async (c: any, next) => {
        c.__user = validUser;
        await next();
      });

      // リクエストを作成してレスポンスを取得
      const res = await app.request("/status", {
        method: "GET",
      });

      // レスポンスのステータスとJSONを確認
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data).toEqual({
        success: true,
        authenticated: true,
      });
    });

    it("非認証の場合はauthenticated:falseを返すこと", async () => {
      // リクエストを作成してレスポンスを取得（ユーザー情報を設定しない）
      const res = await app.request("/status", {
        method: "GET",
      });

      // レスポンスのステータスとJSONを確認
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data).toEqual({
        success: true,
        authenticated: false,
      });
    });

    it("includeUserパラメータがtrueの場合はユーザー情報を含めること", async () => {
      // ユーザー情報を設定
      app.use("/status", async (c: any, next) => {
        c.__user = validUser;
        await next();
      });

      // リクエストを作成してレスポンスを取得
      const res = await app.request("/status?includeUser=true", {
        method: "GET",
      });

      // レスポンスのステータスとJSONを確認
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data).toEqual({
        success: true,
        authenticated: true,
        user: validUser,
      });
    });
  });

  describe("PATCH /auth/profile", () => {
    it("プロフィール情報を更新できること", async () => {
      // 更新するデータ
      const updateData = {
        name: "更新されたユーザー名",
        avatar: "https://example.com/new-avatar.jpg",
      };

      // リクエストを作成してレスポンスを取得
      const res = await app.request("/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      // レスポンスのステータスとJSONを確認
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.user).toHaveProperty("name", "更新されたユーザー名");

      // updateUserが正しいパラメータで呼び出されたことを確認
      expect(mockAuthInstance.api.updateUser).toHaveBeenCalledWith({
        id: validUser.id,
        data: updateData,
      });
    });

    it("更新可能なフィールド以外は無視されること", async () => {
      // 無効なフィールドを含むデータ
      const updateData = {
        name: "更新されたユーザー名",
        id: "invalid-update-attempt", // 更新不可
        email: "new@example.com", // 更新不可
        role: "admin", // 更新不可
      };

      // リクエストを作成してレスポンスを取得
      const res = await app.request("/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      // レスポンスのステータスとJSONを確認
      expect(res.status).toBe(200);

      // updateUserが正しいパラメータで呼び出されたことを確認（無効フィールドは除去されている）
      expect(mockAuthInstance.api.updateUser).toHaveBeenCalledWith({
        id: validUser.id,
        data: {
          name: "更新されたユーザー名",
        },
      });
    });

    it("更新可能なフィールドが指定されていない場合は400エラーを返すこと", async () => {
      // 更新不可のフィールドのみのデータ
      const updateData = {
        id: "invalid-update-attempt",
        email: "new@example.com",
      };

      // リクエストを作成してレスポンスを取得
      const res = await app.request("/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      // レスポンスのステータスとJSONを確認
      expect(res.status).toBe(400);

      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.message).toContain("更新可能なフィールド");
    });
  });

  describe("POST /auth/change-password", () => {
    it("パスワードを変更できること", async () => {
      // パスワード変更データ
      const passwordData = {
        currentPassword: "oldpassword123",
        newPassword: "newpassword123",
      };

      // リクエストを作成してレスポンスを取得
      const res = await app.request("/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(passwordData),
      });

      // レスポンスのステータスとJSONを確認
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.message).toContain("正常に変更");

      // changePasswordが正しいパラメータで呼び出されたことを確認
      expect(mockAuthInstance.api.changePassword).toHaveBeenCalledWith({
        userId: validUser.id,
        currentPassword: "oldpassword123",
        newPassword: "newpassword123",
      });
    });

    it("パスワードが不足している場合は400エラーを返すこと", async () => {
      // 新しいパスワードがない不完全なデータ
      const passwordData = {
        currentPassword: "oldpassword123",
        // newPasswordなし
      };

      // リクエストを作成してレスポンスを取得
      const res = await app.request("/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(passwordData),
      });

      // レスポンスのステータスとJSONを確認
      expect(res.status).toBe(400);

      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.message).toContain("現在のパスワードと新しいパスワードが必要");
    });

    it("新しいパスワードが短すぎる場合は400エラーを返すこと", async () => {
      // 短すぎる新しいパスワード
      const passwordData = {
        currentPassword: "oldpassword123",
        newPassword: "short",
      };

      // リクエストを作成してレスポンスを取得
      const res = await app.request("/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(passwordData),
      });

      // レスポンスのステータスとJSONを確認
      expect(res.status).toBe(400);

      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.message).toContain("8文字以上");
    });

    it("パスワード変更が失敗した場合は400エラーを返すこと", async () => {
      // パスワード変更が失敗する場合のモック
      mockAuthInstance.api.changePassword.mockResolvedValue({
        success: false,
        error: "現在のパスワードが正しくありません",
      });

      // パスワード変更データ
      const passwordData = {
        currentPassword: "wrongpassword",
        newPassword: "newpassword123",
      };

      // リクエストを作成してレスポンスを取得
      const res = await app.request("/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(passwordData),
      });

      // レスポンスのステータスとJSONを確認
      expect(res.status).toBe(400);

      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.message).toContain("現在のパスワードが正しくありません");
    });
  });

  describe("POST /auth/logout", () => {
    it("ログアウトが成功すること", async () => {
      // リクエストを作成してレスポンスを取得
      const res = await app.request("/logout", {
        method: "POST",
      });

      // レスポンスのステータスとJSONを確認
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.message).toContain("ログアウトしました");

      // signOutが呼び出されたことを確認
      expect(mockAuthInstance.api.signOut).toHaveBeenCalled();
    });

    it("ログアウトAPI呼び出しが失敗しても次のミドルウェアを呼び出すこと", async () => {
      // signOutが例外をスローする場合のモック
      mockAuthInstance.api.signOut.mockRejectedValue(new Error("API接続エラー"));

      // リクエストを作成してレスポンスを取得
      const res = await app.request("/logout", {
        method: "POST",
      });

      // エラーになる場合は500を返す
      expect(res.status).toBe(500);

      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.message).toContain("ログアウトに失敗");
    });
  });
});
