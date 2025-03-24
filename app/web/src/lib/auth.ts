import { QueryClient } from "@tanstack/react-query";
import { createAuthClient } from "better-auth/client";

/**
 * セッション情報の型定義
 */
export interface AuthSession {
  /** セッションの一意なID */
  id: string;
  /** ユーザーの一意なID */
  userId: string;
  /** セッションの有効期限 */
  expiresAt: string | Date;
  /** セッションデータ */
  data?: Record<string, unknown>;
}

/**
 * ユーザー情報の型定義
 */
export interface AuthUser {
  /** ユーザーの一意なID */
  id: string;
  /** ユーザーのメールアドレス */
  email?: string;
  /** ユーザーの表示名 */
  name?: string;
  /** ユーザーの追加データ */
  [key: string]: unknown;
}

/**
 * 認証状態のレスポンス型定義
 */
export interface AuthSessionResponse {
  /** セッション情報 */
  data: {
    /** セッションデータ */
    session?: AuthSession;
    /** ユーザーデータ */
    user?: AuthUser;
  } | null;
  /** エラー情報 */
  error: Error | null;
  /** ロード中かどうか */
  isLoading: boolean;
}

/**
 * サインイン（ログイン）レスポンスの型定義
 */
export interface SignInResponse {
  success: boolean;
  message?: string;
  user?: AuthUser;
  session?: AuthSession;
}

/**
 * サインアップ（ユーザー登録）レスポンスの型定義
 */
export interface SignUpResponse {
  success: boolean;
  message?: string;
  user?: AuthUser;
  session?: AuthSession;
}

/**
 * 認証エラーの型定義
 */
export interface AuthError {
  message: string;
  code?: string;
  status?: number;
}

/**
 * 認証状態を追跡するためのクエリキー
 * 認証関連のキャッシュを管理するために使用
 */
export const AUTH_SESSION_KEY = ["auth", "session"];

/**
 * APIのベースURL
 */
export const API_URL = import.meta.env.VITE_API_BASE_URL || "";

/**
 * TanStack Queryのクエリクライアント
 * キャッシュとデータフェッチングを管理する設定済みインスタンス
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1分間のキャッシュ保持
      retry: 1, // エラー時に1回だけ再試行
      refetchOnWindowFocus: false, // ウィンドウフォーカス時の再取得を無効化
    },
  },
});

/**
 * Better Auth クライアントの初期化
 * シングルトンパターンでクライアントインスタンスを管理
 */
let authClientInstance: ReturnType<typeof createAuthClient>;

export function getAuthClient() {
  if (!authClientInstance) {
    authClientInstance = createAuthClient({
      baseURL: API_URL,
      basePath: "/auth",
    });
  }
  return authClientInstance;
}

/**
 * セッション情報を取得する
 */
export const fetchSession = async (): Promise<AuthSessionResponse> => {
  try {
    const authClient = getAuthClient();
    const { data, error } = await authClient.getSession();

    if (error) {
      throw new Error(error.message);
    }

    return {
      data: data
        ? {
            session: {
              id: data.session.id || "",
              userId: data.user?.id || "",
              expiresAt: new Date(),
              data: {},
            } as AuthSession,
            user: data.user as AuthUser,
          }
        : null,
      error: null,
      isLoading: false,
    };
  } catch (error) {
    console.error("セッション情報の取得中にエラーが発生しました", error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error("不明なエラー"),
      isLoading: false,
    };
  }
};

/**
 * サインイン状態かどうかを確認する
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    // セッションをキャッシュから取得（なければフェッチ）
    const sessionData = queryClient.getQueryData<AuthSessionResponse>(AUTH_SESSION_KEY);
    if (sessionData?.data?.session) return true;

    // キャッシュになければ直接フェッチ
    const session = await fetchSession();
    return !!session.data?.session;
  } catch (error) {
    console.error("認証状態の確認中にエラーが発生しました", error);
    return false;
  }
};

/**
 * メールアドレスとパスワードを使用してサインイン（ログイン）する
 */
export const signIn = async (params: {
  email: string;
  password: string;
  rememberMe?: boolean;
}): Promise<SignInResponse> => {
  try {
    const authClient = getAuthClient();
    const { data, error } = await authClient.signIn.email({
      email: params.email,
      password: params.password,
    });

    if (error) {
      throw {
        message: error.message || "ログインに失敗しました",
        code: "auth/sign-in-error",
        status: 400,
      } as AuthError;
    }

    // セッション情報をキャッシュに格納
    queryClient.setQueryData(AUTH_SESSION_KEY, {
      data: {
        session: {
          id: data.token || "",
          userId: data.user?.id || "",
          expiresAt: new Date(),
          data: {},
        } as AuthSession,
        user: data.user as AuthUser,
      },
      error: null,
      isLoading: false,
    });

    return {
      success: true,
      user: data.user as AuthUser,
      session: {
        id: data.token || "",
        userId: data.user?.id || "",
        expiresAt: new Date(),
        data: {},
      } as AuthSession,
    };
  } catch (error) {
    console.error("サインイン中にエラーが発生しました", error);
    throw error;
  }
};

/**
 * 新規ユーザー登録（サインアップ）する
 */
export const signUp = async (params: {
  email: string;
  password: string;
  name: string;
}): Promise<SignUpResponse> => {
  try {
    const authClient = getAuthClient();
    // Better Auth Clientの正しいAPI仕様に合わせる
    const { data, error } = await authClient.signUp.email({
      email: params.email,
      password: params.password,
      name: params.name,
    });

    if (error) {
      throw {
        message: error.message || "登録に失敗しました",
        code:
          error.code === "auth/email-already-in-use"
            ? "auth/email-already-in-use"
            : "auth/sign-up-error",
        status: 400,
      } as AuthError;
    }

    // セッション情報をキャッシュに格納
    queryClient.setQueryData(AUTH_SESSION_KEY, {
      data: {
        session: {
          id: data.token || "",
          userId: data.user?.id || "",
          expiresAt: new Date(),
          data: {},
        } as AuthSession,
        user: data.user as AuthUser,
      },
      error: null,
      isLoading: false,
    });

    return {
      success: true,
      user: data.user as AuthUser,
      session: {
        id: data.token || "",
        userId: data.user?.id || "",
        expiresAt: new Date(),
        data: {},
      } as AuthSession,
    };
  } catch (error) {
    console.error("サインアップ中にエラーが発生しました", error);
    throw error;
  }
};

/**
 * ユーザー情報を取得する
 */
export const getUser = async (): Promise<AuthUser | null> => {
  try {
    // キャッシュからユーザー情報を取得
    const sessionData = queryClient.getQueryData<AuthSessionResponse>(AUTH_SESSION_KEY);
    if (sessionData?.data?.user) return sessionData.data.user;

    // キャッシュになければ直接フェッチ
    const authClient = getAuthClient();
    const { data, error } = await authClient.getSession();

    if (error || !data || !data.user) {
      return null;
    }

    return data.user as AuthUser;
  } catch (error) {
    console.error("ユーザー情報の取得中にエラーが発生しました", error);
    return null;
  }
};

/**
 * セッションを無効化する（ログアウト）
 */
export const signOut = async (): Promise<void> => {
  try {
    const authClient = getAuthClient();
    await authClient.signOut();

    // セッションキャッシュを無効化
    queryClient.invalidateQueries({ queryKey: AUTH_SESSION_KEY });
    // キャッシュから削除
    queryClient.removeQueries({ queryKey: AUTH_SESSION_KEY });
  } catch (error) {
    console.error("ログアウト中にエラーが発生しました", error);
    throw error;
  }
};

/**
 * ユーザープロフィールを更新する
 */
export const updateProfile = async (data: {
  name?: string;
  avatar?: string;
}): Promise<AuthUser> => {
  try {
    const authClient = getAuthClient();
    const { data: userData, error } = await authClient.updateUser({
      name: data.name,
      image: data.avatar,
    });

    if (error) {
      throw new Error(error.message || "プロフィール更新に失敗しました");
    }

    // セッション情報をキャッシュを更新
    const sessionData = queryClient.getQueryData<AuthSessionResponse>(AUTH_SESSION_KEY);
    if (sessionData?.data) {
      queryClient.setQueryData(AUTH_SESSION_KEY, {
        ...sessionData,
        data: {
          ...sessionData.data,
          user: userData as unknown as AuthUser,
        },
      });
    }

    return userData as unknown as AuthUser;
  } catch (error) {
    console.error("プロフィール更新中にエラーが発生しました", error);
    throw error;
  }
};

/**
 * パスワードを変更する
 */
export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ success: boolean; message?: string }> => {
  try {
    const authClient = getAuthClient();
    const { error } = await authClient.changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });

    if (error) {
      throw new Error(error.message || "パスワード変更に失敗しました");
    }

    return { success: true, message: "パスワードが正常に変更されました" };
  } catch (error) {
    console.error("パスワード変更中にエラーが発生しました", error);
    throw error;
  }
};

/**
 * APIリクエスト用のヘッダーを取得する
 * 認証が必要なAPIリクエストで使用
 */
export const getAuthHeaders = async (): Promise<HeadersInit> => {
  try {
    const authClient = getAuthClient();
    const { data } = await authClient.getSession();

    if (data?.session?.id) {
      return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${data.session.id}`,
      };
    }

    return {
      "Content-Type": "application/json",
    };
  } catch (error) {
    return {
      "Content-Type": "application/json",
    };
  }
};
