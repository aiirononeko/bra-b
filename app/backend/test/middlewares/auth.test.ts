import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import type { Context, Next } from "hono";
import type {
  AuthUser,
  AuthSession,
  SessionResponse,
} from "../../src/presentation/middlewares/auth";
import type { BetterAuthInstance } from "../../src/presentation/common";
import { authMiddleware, optionalAuthMiddleware } from "../../src/presentation/middlewares/auth";
import { errThrowHelper } from "../../src/presentation/common";

// エラーヘルパーのモック
vi.mock("../../src/presentation/common", () => {
  return {
    errThrowHelper: vi.fn((status, message) => {
      return new Error(`${status}: ${message}`);
    }),
  };
});

describe("認証ミドルウェアのテスト", () => {
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

  // コンテキストのモック
  interface MockContext {
    req: {
      raw: {
        headers: Headers;
      };
    };
    get: (key: string) => unknown;
    set: (key: string, value: unknown) => void;
    _user?: AuthUser;
    _session?: AuthSession;
    [key: string]: unknown;
  }

  // APIモックの型
  type AuthApiMock = {
    getSession: ReturnType<typeof vi.fn>;
  };

  let mockContext: MockContext;
  let mockNext: ReturnType<typeof vi.fn>;
  let mockBetterAuth: Partial<BetterAuthInstance>;
  let apiMock: AuthApiMock;

  beforeEach(() => {
    // 各テスト前にモックをリセット
    mockNext = vi.fn();

    // APIモックを作成
    apiMock = {
      getSession: vi.fn(),
    };

    // BetterAuthモックを作成
    mockBetterAuth = {
      api: apiMock,
    };

    mockContext = {
      req: {
        raw: {
          headers: new Headers(),
        },
      },
      get: vi.fn((key) => {
        if (key === "auth") return mockBetterAuth;
        if (key === "user") return mockContext._user;
        if (key === "session") return mockContext._session;
        return undefined;
      }),
      set: vi.fn((key, value) => {
        if (key === "user") mockContext._user = value;
        if (key === "session") mockContext._session = value;
      }),
      _user: undefined,
      _session: undefined,
    };

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("authMiddleware", () => {
    it("有効なセッションがあると次のミドルウェアを呼び出す", async () => {
      // 有効なセッションを返すように設定
      apiMock.getSession.mockResolvedValue({
        data: {
          user: validUser,
          session: validSession,
        },
      });

      await authMiddleware(mockContext as unknown as Context, mockNext);

      // コンテキストにユーザーとセッションが設定されている
      expect(mockContext.set).toHaveBeenCalledWith("user", validUser);
      expect(mockContext.set).toHaveBeenCalledWith("session", validSession);
      // 次のミドルウェアが呼び出されている
      expect(mockNext).toHaveBeenCalled();
    });

    it("セッションがない場合は401エラーをスロー", async () => {
      // セッションがないレスポンスを返すように設定
      apiMock.getSession.mockResolvedValue({
        data: null,
      });

      await expect(authMiddleware(mockContext as unknown as Context, mockNext)).rejects.toThrow();

      // エラーヘルパーが呼ばれたことを確認
      expect(errThrowHelper).toHaveBeenCalledWith(401, "認証が必要です");
      // 次のミドルウェアは呼ばれない
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("ユーザー情報がない場合は401エラーをスロー", async () => {
      // ユーザーなしセッションを返すように設定
      apiMock.getSession.mockResolvedValue({
        data: {
          session: validSession,
          // userなし
        },
      });

      await expect(authMiddleware(mockContext as unknown as Context, mockNext)).rejects.toThrow();

      // エラーヘルパーが呼ばれたことを確認
      expect(errThrowHelper).toHaveBeenCalledWith(401, "有効なユーザー情報がありません");
      // 次のミドルウェアは呼ばれない
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("認証インスタンスがない場合は500エラーをスロー", async () => {
      // 認証インスタンスをnullに設定
      mockContext.get = vi.fn((key) => {
        if (key === "auth") return null;
        return undefined;
      });

      await expect(authMiddleware(mockContext as unknown as Context, mockNext)).rejects.toThrow();

      // エラーヘルパーが呼ばれたことを確認
      expect(errThrowHelper).toHaveBeenCalledWith(500, "認証システムエラー");
      // 次のミドルウェアは呼ばれない
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("getSessionが例外をスローした場合はエラーをハンドリング", async () => {
      // getSessionが例外をスロー
      apiMock.getSession.mockRejectedValue(new Error("APIエラー"));

      await expect(authMiddleware(mockContext as unknown as Context, mockNext)).rejects.toThrow();

      // エラーが適切にログ出力されることを確認（console.errorのモックが必要）
      // エラーヘルパーが呼ばれたことを確認
      expect(errThrowHelper).toHaveBeenCalledWith(401, "認証エラー: APIエラー");
      // 次のミドルウェアは呼ばれない
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("optionalAuthMiddleware", () => {
    it("有効なセッションがあるとユーザーとセッションを設定", async () => {
      // 有効なセッションを返すように設定
      apiMock.getSession.mockResolvedValue({
        data: {
          user: validUser,
          session: validSession,
        },
      });

      await optionalAuthMiddleware(mockContext as unknown as Context, mockNext);

      // コンテキストにユーザーとセッションが設定されている
      expect(mockContext.set).toHaveBeenCalledWith("user", validUser);
      expect(mockContext.set).toHaveBeenCalledWith("session", validSession);
      // 次のミドルウェアが呼び出されている
      expect(mockNext).toHaveBeenCalled();
    });

    it("セッションがなくても次のミドルウェアを呼び出す", async () => {
      // セッションがないレスポンスを返すように設定
      apiMock.getSession.mockResolvedValue({
        data: null,
      });

      await optionalAuthMiddleware(mockContext as unknown as Context, mockNext);

      // ユーザーとセッションは設定されない
      expect(mockContext.set).not.toHaveBeenCalledWith("user", expect.anything());
      expect(mockContext.set).not.toHaveBeenCalledWith("session", expect.anything());
      // 次のミドルウェアが呼び出されている
      expect(mockNext).toHaveBeenCalled();
    });

    it("認証インスタンスがなくても次のミドルウェアを呼び出す", async () => {
      // 認証インスタンスをnullに設定
      mockContext.get = vi.fn((key) => {
        if (key === "auth") return null;
        return undefined;
      });

      await optionalAuthMiddleware(mockContext as unknown as Context, mockNext);

      // ユーザーとセッションは設定されない
      expect(mockContext.set).not.toHaveBeenCalledWith("user", expect.anything());
      expect(mockContext.set).not.toHaveBeenCalledWith("session", expect.anything());
      // 次のミドルウェアが呼び出されている
      expect(mockNext).toHaveBeenCalled();
    });

    it("getSessionが例外をスローしても次のミドルウェアを呼び出す", async () => {
      // getSessionが例外をスロー
      apiMock.getSession.mockRejectedValue(new Error("APIエラー"));

      await optionalAuthMiddleware(mockContext as unknown as Context, mockNext);

      // ユーザーとセッションは設定されない
      expect(mockContext.set).not.toHaveBeenCalledWith("user", expect.anything());
      expect(mockContext.set).not.toHaveBeenCalledWith("session", expect.anything());
      // 次のミドルウェアが呼び出されている
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
