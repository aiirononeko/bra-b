import { createAuthClient } from "@better-auth/client";
import { QueryClient } from "@tanstack/react-query";

/**
 * 認証状態を追跡するためのクエリキー
 */
export const AUTH_SESSION_KEY = ["auth", "session"];

/**
 * BetterAuthクライアントの設定
 */
export const authClient = createAuthClient();

// APIのエンドポイントを設定
const API_URL = import.meta.env.VITE_API_URL || "";
// @ts-ignore - BetterAuthクライアントの型定義が不完全なため
authClient.baseURL = `${API_URL}/auth`;

/**
 * TanStack Queryのクエリクライアント
 * アプリケーション全体で使用する単一のインスタンス
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1分
      retry: 1,
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
