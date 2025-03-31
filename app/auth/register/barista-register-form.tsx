"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { signInWithGoogle, signInWithMagicLink } from "@/app/actions/auth";
import { type RegisterFormValues, registerSchema } from "@/app/lib/schemas/auth-schemas";

interface BaristaRegisterFormProps {
  anonymousId?: string;
}

export function BaristaRegisterForm({ anonymousId }: BaristaRegisterFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  // React Hook Formの初期化
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      userType: "barista",
      displayName: "",
      authType: "magic_link", // デフォルトをマジックリンクに設定
      anonymousId, // 匿名IDをフォームデータに含める
    },
  });

  // フォーム送信時の処理
  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    setAuthError(null);

    try {
      // 認証方法によって処理を分岐
      const { email, displayName, userType, authType } = data;

      type AuthResult = { success: boolean; error?: string; redirectTo?: string };
      let result: AuthResult;

      switch (authType) {
        case "magic_link":
          result = await signInWithMagicLink({
            email,
            userType,
            displayName,
          });
          break;

        case "google":
          result = await signInWithGoogle({
            userType,
            displayName,
          });
          break;

        default:
          setAuthError("サポートされていない認証方法です");
          setIsSubmitting(false);
          return;
      }

      if (!result.success) {
        setAuthError(result.error || "登録処理中にエラーが発生しました");
        return;
      }

      if (result.redirectTo) {
        // 結果でリダイレクト先が指定されている場合はリダイレクト
        setSuccessMessage("登録が完了しました。リダイレクトします...");
        setTimeout(() => {
          router.push(result.redirectTo || "/account");
        }, 1500);
      } else {
        // それ以外の場合は成功メッセージを表示
        setSuccessMessage("登録確認メールを送信しました。メールをご確認ください。");
      }
    } catch (error) {
      console.error("登録エラー:", error);
      setAuthError("登録処理中にエラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 px-6 py-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-center">バリスタ登録</h2>

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
            htmlFor="displayName"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            表示名 <span className="text-red-500">*</span>
          </label>
          <input
            id="displayName"
            {...register("displayName")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
          {errors.displayName && (
            <p className="mt-1 text-sm text-red-600">{errors.displayName.message}</p>
          )}
        </div>

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

        <div className="mb-4">
          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              認証方法 <span className="text-red-500">*</span>
            </legend>
            <div className="flex flex-col space-y-2">
              <label htmlFor="auth-magic-link" className="inline-flex items-center">
                <input
                  id="auth-magic-link"
                  type="radio"
                  value="magic_link"
                  {...register("authType")}
                  className="form-radio text-blue-600"
                />
                <span className="ml-2">マジックリンク認証（パスワード不要）</span>
              </label>
              <label htmlFor="auth-google" className="inline-flex items-center">
                <input
                  id="auth-google"
                  type="radio"
                  value="google"
                  {...register("authType")}
                  className="form-radio text-blue-600"
                />
                <span className="ml-2">Google認証</span>
              </label>
            </div>
            {errors.authType && (
              <p className="mt-1 text-sm text-red-600">{errors.authType.message}</p>
            )}
          </fieldset>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? "登録中..." : "登録する"}
          </button>
        </div>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          すでにアカウントをお持ちの場合は{" "}
          <Link href="/auth/login" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
            こちら
          </Link>
          からログインできます。
        </p>
      </div>
    </div>
  );
}
