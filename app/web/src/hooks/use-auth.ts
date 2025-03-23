import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  AUTH_SESSION_KEY,
  updateProfile as updateProfileAPI,
  changePassword as changePasswordAPI,
  signOut,
  signUp,
  signIn,
  fetchSession,
  type AuthUser,
  type AuthSessionResponse,
  type SignInResponse,
  type SignUpResponse,
  type AuthError,
} from "../lib/auth";

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
 * TanStack Queryを使用してセッション情報をフェッチし、キャッシュする
 *
 * @returns セッション情報と認証状態
 */
export const useAuthSession = () => {
  return useQuery<AuthSessionResponse, Error>({
    queryKey: AUTH_SESSION_KEY,
    queryFn: fetchSession,
    staleTime: 5 * 60 * 1000, // 5分間キャッシュを保持
    refetchOnWindowFocus: true, // ウィンドウフォーカス時に再取得
  });
};

/**
 * 現在のユーザー情報を取得するフック
 *
 * @returns 現在のユーザー情報
 */
export const useCurrentUser = () => {
  const { data: sessionData } = useAuthSession();
  return sessionData?.data?.user;
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

  return useMutation<SignInResponse, AuthError, EmailSignInParams>({
    mutationFn: async ({ email, password, rememberMe = true }: EmailSignInParams) => {
      try {
        return await signIn({
          email,
          password,
          rememberMe,
        });
      } catch (error) {
        if (error && typeof error === "object" && "message" in error) {
          throw error as AuthError;
        }
        throw {
          message: "不明なエラーが発生しました",
          code: "auth/unknown-error",
        } as AuthError;
      }
    },
    onSuccess: (data) => {
      // セッション情報のキャッシュを更新
      queryClient.invalidateQueries({ queryKey: AUTH_SESSION_KEY });
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

  return useMutation<void, AuthError, void>({
    mutationFn: async () => {
      try {
        await signOut();
      } catch (error) {
        if (error && typeof error === "object" && "message" in error) {
          throw error as AuthError;
        }
        throw {
          message: "ログアウト処理中にエラーが発生しました",
          code: "auth/unknown-error",
        } as AuthError;
      }
    },
    onSuccess: () => {
      // セッション情報のキャッシュをクリア
      queryClient.invalidateQueries({ queryKey: AUTH_SESSION_KEY });
      // 他の認証関連データも必要に応じてクリア
      queryClient.resetQueries();
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

  return useMutation<SignUpResponse, AuthError, EmailSignUpParams>({
    mutationFn: async ({ email, password, name }: EmailSignUpParams) => {
      try {
        return await signUp({
          email,
          password,
          name,
        });
      } catch (error) {
        if (error && typeof error === "object" && "message" in error) {
          throw error as AuthError;
        }
        throw {
          message: "新規登録中にエラーが発生しました",
          code: "auth/unknown-error",
        } as AuthError;
      }
    },
    onSuccess: (data) => {
      // セッション情報のキャッシュを更新
      queryClient.invalidateQueries({ queryKey: AUTH_SESSION_KEY });
    },
  });
};

/**
 * プロフィール更新のパラメータ
 */
export interface UpdateProfileParams {
  /** ユーザーの表示名 */
  name?: string;
  /** ユーザーのアバター画像URL */
  avatar?: string;
}

/**
 * ユーザープロフィールを更新するためのフック
 *
 * ユーザーのプロフィール情報（名前、アバターなど）を更新する
 *
 * @returns プロフィール更新処理のmutation
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<AuthUser, AuthError, UpdateProfileParams>({
    mutationFn: async (data: UpdateProfileParams) => {
      try {
        return await updateProfileAPI(data);
      } catch (error) {
        if (error && typeof error === "object" && "message" in error) {
          throw error as AuthError;
        }
        throw {
          message: "プロフィールの更新中にエラーが発生しました",
          code: "auth/unknown-error",
        } as AuthError;
      }
    },
    onSuccess: () => {
      // 認証情報のキャッシュを更新
      queryClient.invalidateQueries({ queryKey: AUTH_SESSION_KEY });
    },
  });
};

/**
 * パスワード変更のパラメータ
 */
export interface ChangePasswordParams {
  /** 現在のパスワード */
  currentPassword: string;
  /** 新しいパスワード */
  newPassword: string;
}

/**
 * ユーザーのパスワードを変更するためのフック
 *
 * 現在のパスワードを確認し、新しいパスワードに変更する
 *
 * @returns パスワード変更処理のmutation
 */
export const useChangePassword = () => {
  return useMutation<{ success: boolean; message?: string }, AuthError, ChangePasswordParams>({
    mutationFn: async ({ currentPassword, newPassword }: ChangePasswordParams) => {
      try {
        return await changePasswordAPI({ currentPassword, newPassword });
      } catch (error) {
        if (error && typeof error === "object" && "message" in error) {
          throw error as AuthError;
        }
        throw {
          message: "パスワードの変更中にエラーが発生しました",
          code: "auth/unknown-error",
        } as AuthError;
      }
    },
  });
};
