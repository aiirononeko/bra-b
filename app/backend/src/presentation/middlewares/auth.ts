import type { Context, Next } from "hono";

import { errThrowHelper } from "../common";
import type { Env } from "../../types";
import type { Database } from "../../types";
import type { BetterAuthInstance } from "../common";

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
 * セッション情報の型定義
 */
export interface AuthSession {
  /** セッションの一意なID */
  id: string;
  /** ユーザーの一意なID */
  userId: string;
  /** セッションの有効期限 */
  expiresAt: Date | string;
  /** セッションの追加データ */
  [key: string]: unknown;
}

/**
 * セッションレスポンスの型定義
 */
export interface SessionResponse {
  data?: {
    user?: AuthUser;
    session?: AuthSession;
  };
  error?: Error | null;
}

/**
 * Honoコンテキストの変数型
 */
export type AuthContextVariables = {
  db: Database;
  auth: BetterAuthInstance;
  user?: AuthUser;
  session?: AuthSession;
};

/**
 * 認証ミドルウェア
 *
 * BetterAuthを使用してセッションを検証し、認証済みユーザーのみアクセスを許可する
 * ユーザー情報とセッション情報をコンテキストに設定する
 *
 * @param c - Honoのコンテキスト
 * @param next - 次のミドルウェアを呼び出す関数
 * @returns Responseオブジェクト
 */
export const authMiddleware = async (
  c: Context<{
    Bindings: Env;
    Variables: AuthContextVariables;
  }>,
  next: Next,
) => {
  try {
    // リクエストコンテキストから認証インスタンスを取得
    const authInstance = c.get("auth");

    if (!authInstance?.api?.getSession) {
      console.error("認証インスタンスが初期化されていません");
      throw errThrowHelper(500, "認証システムエラー");
    }

    // セッション情報を取得
    const sessionResponse = (await authInstance.api.getSession({
      headers: c.req.raw.headers,
    })) as SessionResponse;

    // セッションが存在しない場合は認証エラー
    if (!sessionResponse?.data) {
      throw errThrowHelper(401, "認証が必要です");
    }

    const { user, session } = sessionResponse.data;

    // ユーザー情報が存在しない場合は認証エラー
    if (!user?.id) {
      throw errThrowHelper(401, "有効なユーザー情報がありません");
    }

    // ユーザー情報とセッション情報をコンテキストに設定
    c.set("user", user);
    if (session) {
      c.set("session", session);
    }

    // 認証成功、次のミドルウェアへ
    await next();
  } catch (error) {
    // Responseオブジェクトの場合はそのまま投げる
    if (error instanceof Response) {
      throw error;
    }

    // エラーメッセージをログに出力
    console.error("認証エラー:", error);

    // 認証エラーレスポンスを返す
    if (error instanceof Error) {
      throw errThrowHelper(401, `認証エラー: ${error.message}`);
    }

    throw errThrowHelper(401, "認証エラー");
  }
};

/**
 * オプショナル認証ミドルウェア
 *
 * セッションが存在する場合はユーザー情報を設定するが、
 * セッションが存在しない場合もエラーにせず次のミドルウェアに進む
 *
 * @param c - Honoのコンテキスト
 * @param next - 次のミドルウェアを呼び出す関数
 * @returns Responseオブジェクト
 */
export const optionalAuthMiddleware = async (
  c: Context<{
    Bindings: Env;
    Variables: AuthContextVariables;
  }>,
  next: Next,
) => {
  try {
    // リクエストコンテキストから認証インスタンスを取得
    const authInstance = c.get("auth");

    if (authInstance?.api?.getSession) {
      // セッション情報を取得
      const sessionResponse = (await authInstance.api.getSession({
        headers: c.req.raw.headers,
      })) as SessionResponse;

      // セッションが存在する場合はユーザー情報を設定
      if (sessionResponse?.data) {
        const { user, session } = sessionResponse.data;

        if (user?.id) {
          c.set("user", user);
          if (session) {
            c.set("session", session);
          }
        }
      }
    }

    // 認証の有無に関わらず次のミドルウェアへ
    await next();
  } catch (error) {
    // エラーがあっても認証は必須ではないため、ログ出力のみ
    console.warn("オプショナル認証でエラーが発生しました:", error);
    await next();
  }
};
