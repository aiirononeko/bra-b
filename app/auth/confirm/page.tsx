import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { confirmAuth } from "@/app/actions/auth";
import { createClient } from "@/utils/supabase/server";

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
  const code = getStringParam(params.code) || getStringParam(params.token);
  const type = getStringParam(params.type) || "email";
  const next = getStringParam(params.next) || "/";

  console.log("認証確認ページ: パラメータ", {
    tokenHash: tokenHash ? "存在" : "なし",
    code: code ? "存在" : "なし",
    type,
    next,
  });

  // 認証処理を実行
  const result = await confirmAuth({
    tokenHash,
    code,
    type,
    anonymousId: null,
  });

  console.log("認証結果:", { success: result.success, redirectPath: result.redirectPath });

  // 認証が完了した後でセッションを確認（デバッグ用）
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  console.log("認証処理後のセッション状態:", session ? "セッションあり" : "セッションなし");

  if (session) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log("認証されたユーザー情報:", user ? `ID: ${user.id}` : "ユーザー情報なし");
  }

  // baseUrlを決定（優先順位: 環境変数 > result.baseUrl > デフォルト）
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || result.baseUrl || "http://localhost:3000";

  // 処理が完了したら、基本的にnextパラメータがあればそちらを優先する
  if (result.success) {
    // nextパラメータがあれば優先
    const redirectTo = next && next !== "/" ? next : result.redirectPath;
    console.log(`リダイレクト: ${redirectTo}`);

    // 成功メッセージを付けて指定URLにリダイレクト
    const successUrl = new URL(redirectTo, baseUrl);
    successUrl.searchParams.set("auth_success", "true");
    successUrl.searchParams.set("message", result.message || "認証に成功しました");

    return redirect(successUrl.toString());
  }

  // 失敗時: エラーページにリダイレクト
  console.log(`認証失敗: ${result.error || "不明なエラー"}`);

  // エラーの場合も元のnextパラメータがあれば、ログインページにリダイレクト
  if (next && next !== "/") {
    console.log(`next パラメータありのため、ログインページへリダイレクト: ${next}`);
    const loginUrl = new URL("/login", baseUrl);
    loginUrl.searchParams.set("error", result.error || "認証に失敗しました");
    loginUrl.searchParams.set("next", next);
    return redirect(loginUrl.toString());
  }

  // それ以外はエラーページへ
  const errorUrl = new URL("/error", baseUrl);
  if (result.error) {
    errorUrl.searchParams.set("error", result.error);
  }

  return redirect(errorUrl.toString());
}
