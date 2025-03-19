import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient, useSession } from "../lib/auth";

// クエリキー
const SESSION_KEY = ["session"];

/**
 * 現在のセッション情報を取得するフック
 */
export const useAuthSession = () => {
  return useSession();
};

/**
 * メールアドレスとパスワードでログインするフック
 */
export const useEmailSignIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // @ts-ignore - BetterAuthクライアントの型定義が不完全なため
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      // @ts-ignore - BetterAuthクライアントの型定義が不完全なため
      return await authClient.signIn.email({
        email,
        password,
        rememberMe: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SESSION_KEY });
    },
  });
};

/**
 * ログアウトするフック
 */
export const useSignOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // @ts-ignore - BetterAuthクライアントの型定義が不完全なため
    mutationFn: async () => {
      // @ts-ignore - BetterAuthクライアントの型定義が不完全なため
      return await authClient.signOut();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SESSION_KEY });
    },
  });
};

/**
 * メールアドレスとパスワードで新規登録するフック
 */
export const useEmailSignUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // @ts-ignore - BetterAuthクライアントの型定義が不完全なため
    mutationFn: async ({
      email,
      password,
      name,
    }: {
      email: string;
      password: string;
      name: string;
    }) => {
      // @ts-ignore - BetterAuthクライアントの型定義が不完全なため
      return await authClient.signUp.email({
        email,
        password,
        name,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SESSION_KEY });
    },
  });
};
