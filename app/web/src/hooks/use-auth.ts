import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient, useSession } from "../lib/auth";

// クエリキー（セッション情報の一意な識別子）
const SESSION_KEY = ["session"];

/**
 * 認証関連のエラー型定義
 */
export interface AuthError {
  message: string;
  code?: string;
  status?: number;
}

/**
 * メールサインインのパラメータ
 */
export interface EmailSignInParams {
  /** ユーザーのメールアドレス */
  email: string;
  /** ユーザーのパスワード */
  password: string;
  /** セッションを記憶するかどうか（デフォルト: true） */
  rememberMe?: boolean;
}

/**
 * メールサインアップのパラメータ
 */
export interface EmailSignUpParams {
  /** ユーザーのメールアドレス */
  email: string;
  /** ユーザーのパスワード */
  password: string;
  /** ユーザーの表示名 */
  name: string;
}

/**
 * 現在のセッション情報を取得するフック
 *
 * ユーザーが認証されているかどうかと、現在のセッション情報を提供する
 *
 * @returns セッション情報と認証状態
 */
export const useAuthSession = () => {
  return useSession();
};

/**
 * メールアドレスとパスワードでログインするためのフック
 *
 * ユーザーのログイン処理を実行し、成功時にはセッション情報を更新する
 *
 * @returns ログイン処理のmutation
 */
export const useEmailSignIn = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, AuthError, EmailSignInParams>({
    // @ts-ignore - BetterAuthクライアントの型定義が不完全なため
    mutationFn: async ({ email, password, rememberMe = true }: EmailSignInParams) => {
      try {
        // @ts-ignore - BetterAuthクライアントの型定義が不完全なため
        return await authClient.signIn.email({
          email,
          password,
          rememberMe,
        });
      } catch (error) {
        // エラーオブジェクトの標準化
        if (error instanceof Error) {
          throw {
            message: error.message,
            code: "auth/sign-in-error",
          } as AuthError;
        }
        throw {
          message: "不明なエラーが発生しました",
          code: "auth/unknown-error",
        } as AuthError;
      }
    },
    onSuccess: () => {
      // セッション情報のキャッシュを更新
      queryClient.invalidateQueries({ queryKey: SESSION_KEY });
    },
  });
};

/**
 * ログアウトするためのフック
 *
 * 現在のユーザーセッションを終了し、認証状態をクリアする
 *
 * @returns ログアウト処理のmutation
 */
export const useSignOut = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, AuthError, void>({
    // @ts-ignore - BetterAuthクライアントの型定義が不完全なため
    mutationFn: async () => {
      try {
        // @ts-ignore - BetterAuthクライアントの型定義が不完全なため
        return await authClient.signOut();
      } catch (error) {
        // エラーオブジェクトの標準化
        if (error instanceof Error) {
          throw {
            message: error.message,
            code: "auth/sign-out-error",
          } as AuthError;
        }
        throw {
          message: "ログアウト処理中にエラーが発生しました",
          code: "auth/unknown-error",
        } as AuthError;
      }
    },
    onSuccess: () => {
      // セッション情報のキャッシュをクリア
      queryClient.invalidateQueries({ queryKey: SESSION_KEY });

      // 他の認証関連データも必要に応じてクリア
      queryClient.removeQueries({ queryKey: ["user"] });
    },
  });
};

/**
 * メールアドレスとパスワードで新規登録するためのフック
 *
 * 新しいユーザーアカウントを作成し、成功時には自動的にログイン状態にする
 *
 * @returns 新規登録処理のmutation
 */
export const useEmailSignUp = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, AuthError, EmailSignUpParams>({
    // @ts-ignore - BetterAuthクライアントの型定義が不完全なため
    mutationFn: async ({ email, password, name }: EmailSignUpParams) => {
      try {
        // @ts-ignore - BetterAuthクライアントの型定義が不完全なため
        return await authClient.signUp.email({
          email,
          password,
          name,
        });
      } catch (error) {
        // エラーオブジェクトの標準化
        if (error instanceof Error) {
          throw {
            message: error.message,
            code: "auth/sign-up-error",
          } as AuthError;
        }
        throw {
          message: "新規登録中にエラーが発生しました",
          code: "auth/unknown-error",
        } as AuthError;
      }
    },
    onSuccess: () => {
      // セッション情報のキャッシュを更新
      queryClient.invalidateQueries({ queryKey: SESSION_KEY });
    },
  });
};
