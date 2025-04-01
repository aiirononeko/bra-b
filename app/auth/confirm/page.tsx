import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { confirmAuth } from "@/app/actions/auth";

export const metadata: Metadata = {
  title: "認証中...",
  description: "アカウント認証を処理中です",
};

// SearchParamsの型定義をより具体的に
type SearchParams = { [key: string]: string | string[] | undefined };

/**
 * 認証確認ページ
 * URLパラメータを処理してユーザー認証を行い、適切なページにリダイレクトします
 */
export default async function ConfirmAuthPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // searchParamsをawaitして安全に使用
  const params = await searchParams;

  // 処理しやすいように型を変換
  const getStringParam = (param: string | string[] | undefined): string | undefined => {
    if (typeof param === "string") return param;
    if (Array.isArray(param) && param.length > 0) return param[0];
    return undefined;
  };

  // 認証パラメータを取得
  const tokenHash = getStringParam(params.token_hash);
  // Supabaseでは、codeまたはtokenという名前でパラメータが送信される場合がある
  const code = getStringParam(params.code) || getStringParam(params.token);
  const type = getStringParam(params.type) || "email";

  // 直接認証処理を実行
  const result = await confirmAuth({
    tokenHash,
    code,
    type,
    anonymousId: null,
  });

  if (result.success) {
    // 成功時のリダイレクト
    const redirectUrl = new URL(result.redirectPath, process.env.NEXT_PUBLIC_BASE_URL);
    redirectUrl.searchParams.set("auth_success", "true");
    redirectUrl.searchParams.set("message", result.message || "認証に成功しました");

    redirect(redirectUrl.toString());
  } else {
    // エラー時のリダイレクト
    const errorUrl = new URL("/error", process.env.NEXT_PUBLIC_BASE_URL);
    if (result.error) {
      errorUrl.searchParams.set("error", result.error);
    }

    redirect(errorUrl.toString());
  }

  // この行には到達しませんが、TypeScript対応のために空のdiv要素を返す
  return <div />;
}
