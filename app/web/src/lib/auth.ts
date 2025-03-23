import { createAuthClient } from "@better-auth/client";
import { QueryClient } from "@tanstack/react-query";

/**
 * セッション情報の型定義
 * BetterAuthの型情報が不完全なため独自に定義
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
 * BetterAuthの型情報が不完全なため独自に定義
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
}

/**
 * 認証状態を追跡するためのクエリキー
 * 認証関連のキャッシュを管理するために使用
 */
export const AUTH_SESSION_KEY = ["auth", "session"];

/**
 * BetterAuthクライアントの設定
 * 認証に関連する操作を提供するクライアント
 */
export const authClient = createAuthClient();

// APIのエンドポイントを設定
const API_URL = import.meta.env.VITE_API_URL || "";
// @ts-ignore - BetterAuthクライアントの型定義が不完全なため
authClient.baseURL = `${API_URL}/auth`;

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
 * サインイン状態かどうかを確認する
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    // セッションをキャッシュから取得（なければフェッチ）
    const sessionData = queryClient.getQueryData(AUTH_SESSION_KEY);
    if (sessionData) return true;

    // キャッシュになければ直接フェッチ
    // @ts-ignore - BetterAuthクライアントの型定義が不完全なため
    const session = await authClient.getSession();
    return !!session.data;
  } catch (error) {
    console.error("認証状態の確認中にエラーが発生しました", error);
    return false;
  }
};

/**
 * ユーザー情報を取得する
 */
export const getUser = async () => {
  try {
    // @ts-ignore - BetterAuthクライアントの型定義が不完全なため
    const session = await authClient.getSession();
    return session.data?.user;
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
    // @ts-ignore - BetterAuthクライアントの型定義が不完全なため
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

// エクスポートして他のコンポーネントから利用できるようにする
// @ts-ignore - BetterAuthクライアントの型定義が不完全なため
export const { signIn, signUp, useSession } = authClient;

/**
 * 認証リクエスト時のヘッダーを設定するヘルパー関数
 * 他のAPIリクエストで認証トークンを付与する際に使用
 */
export const getAuthHeaders = async (): Promise<HeadersInit> => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  try {
    // @ts-ignore - BetterAuthクライアントの型定義が不完全なため
    const cookie = authClient.getCookie?.();
    if (cookie) {
      headers.Cookie = cookie;
    }
  } catch (error) {
    console.error("認証ヘッダーの取得中にエラー", error);
  }

  return headers;
};
