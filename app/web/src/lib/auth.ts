import { QueryClient } from "@tanstack/react-query";

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
export const AUTH_API_URL = `${API_URL}/auth`;

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
 * セッション情報を取得する
 */
export const fetchSession = async (): Promise<AuthSessionResponse> => {
  try {
    const response = await fetch(`${AUTH_API_URL}/session`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`セッション取得エラー: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return {
      data: result.data || null,
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
    const response = await fetch(`${AUTH_API_URL}/signin`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: params.email,
        password: params.password,
        rememberMe: params.rememberMe ?? true,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw {
        message: result.message || "ログインに失敗しました",
        code: response.status === 401 ? "auth/invalid-credentials" : "auth/sign-in-error",
        status: response.status,
      } as AuthError;
    }

    // セッション情報をキャッシュに格納
    queryClient.setQueryData(AUTH_SESSION_KEY, {
      data: {
        session: result.session,
        user: result.user,
      },
      error: null,
      isLoading: false,
    });

    return result;
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
    const response = await fetch(`${AUTH_API_URL}/signup`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: params.email,
        password: params.password,
        name: params.name,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw {
        message: result.message || "登録に失敗しました",
        code: response.status === 409 ? "auth/email-already-in-use" : "auth/sign-up-error",
        status: response.status,
      } as AuthError;
    }

    // セッション情報をキャッシュに格納
    queryClient.setQueryData(AUTH_SESSION_KEY, {
      data: {
        session: result.session,
        user: result.user,
      },
      error: null,
      isLoading: false,
    });

    return result;
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
    const session = await fetchSession();
    return session.data?.user || null;
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
    await fetch(`${AUTH_API_URL}/signout`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

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
    const response = await fetch(`${AUTH_API_URL}/profile`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "プロフィール更新に失敗しました");
    }

    // セッション情報をキャッシュを更新
    const sessionData = queryClient.getQueryData<AuthSessionResponse>(AUTH_SESSION_KEY);
    if (sessionData?.data) {
      queryClient.setQueryData(AUTH_SESSION_KEY, {
        ...sessionData,
        data: {
          ...sessionData.data,
          user: result.user,
        },
      });
    }

    return result.user;
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
    const response = await fetch(`${AUTH_API_URL}/change-password`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "パスワード変更に失敗しました");
    }

    return result;
  } catch (error) {
    console.error("パスワード変更中にエラーが発生しました", error);
    throw error;
  }
};

/**
 * APIリクエスト用のヘッダーを取得する
 * 認証が必要なAPIリクエストで使用
 */
export const getAuthHeaders = (): HeadersInit => {
  return {
    "Content-Type": "application/json",
  };
};
