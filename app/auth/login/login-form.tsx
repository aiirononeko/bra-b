"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { signInWithGoogle, signInWithMagicLink } from "@/app/actions/auth";
import { type LoginFormValues, loginSchema } from "@/app/lib/schemas/auth-schemas";
import { getAnonymousIdFromClient } from "@/app/utils/anonymous-auth/client";

interface LoginFormProps {
  initialMessage?: string | null;
}

export function LoginForm({ initialMessage }: LoginFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(initialMessage || null);

  // コンポーネントマウント時に匿名IDを取得
  useEffect(() => {
    const fetchAnonymousId = async () => {
      const id = getAnonymousIdFromClient();
      if (id) {
        console.log("匿名ID取得:", id);
      }
    };

    fetchAnonymousId();
  }, []);

  // initialMessageが変更された場合に表示を更新
  useEffect(() => {
    if (initialMessage) {
      setSuccessMessage(initialMessage);
    }
  }, [initialMessage]);

  // React Hook Formの初期化
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      authType: "magic_link",
    },
  });

  // マジックリンクでのログイン（フォーム送信時の処理）
  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    setAuthError(null);

    try {
      const email = data.email;
      if (!email) {
        setAuthError("メールアドレスを入力してください");
        setIsSubmitting(false);
        return;
      }

      // マジックリンク認証実行
      const result = await signInWithMagicLink({
        email,
        userType: "customer",
        displayName: email.split("@")[0],
      });

      if (!result.success) {
        setAuthError(result.error || "マジックリンク送信中にエラーが発生しました");
        return;
      }

      if (result.redirectTo) {
        setSuccessMessage("マジックリンクをメールで送信しました。メールをご確認ください。");
      } else {
        setSuccessMessage("マジックリンク送信が完了しました。メールをご確認ください。");
      }
    } catch (error) {
      console.error("マジックリンクエラー:", error);
      setAuthError("マジックリンク送信中にエラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google認証の処理
  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setAuthError(null);

    try {
      // Server Actionを使用してGoogle認証処理を実行
      const result = await signInWithGoogle({
        userType: "customer",
        displayName: "User",
      });

      if (!result.success) {
        setAuthError(result.error || "Google認証中にエラーが発生しました");
      }
      // Google認証の場合、成功時にリダイレクトされるためここでは何もしない
    } catch (error) {
      console.error("Google認証エラー:", error);
      setAuthError("Google認証中にエラーが発生しました");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 px-6 py-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-center">ログイン</h2>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      {authError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {authError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            メールアドレス <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>

        <div className="flex flex-col space-y-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? "処理中..." : "マジックリンクでログイン"}
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-labelledby="googleLoginIconTitle"
            >
              <title id="googleLoginIconTitle">Google</title>
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path
                  fill="#4285F4"
                  d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
                />
                <path
                  fill="#34A853"
                  d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
                />
                <path
                  fill="#FBBC05"
                  d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
                />
                <path
                  fill="#EA4335"
                  d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
                />
              </g>
            </svg>
            Googleでログイン
          </button>
        </div>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          アカウントをお持ちでない場合は{" "}
          <Link
            href="/auth/register"
            className="text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            こちら
          </Link>
          から登録できます。
        </p>
      </div>
    </div>
  );
}
