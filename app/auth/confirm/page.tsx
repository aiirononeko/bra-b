import { confirmAuth } from "@/app/actions/auth";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// デバッグ関数
function logDebug(message: string, data?: any) {
  console.log(`[CONFIRM_DEBUG] ${message}`, data ? JSON.stringify(data, null, 2) : "");
}

export const metadata: Metadata = {
  title: "認証確認",
  description: "メールリンク認証処理を完了中...",
};

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: { token_hash?: string; code?: string; type?: string; next?: string };
}) {
  // パラメータを取得
  const { token_hash, code, type, next } = searchParams;

  logDebug("認証確認ページ開始", {
    token_hash: token_hash ? "存在" : "なし",
    code: code ? "存在" : "なし",
    type,
    next,
  });

  // 匿名IDを取得
  const cookieStore = await cookies();
  const anonymousId = cookieStore.get("anonymous_id")?.value || null;

  logDebug("Cookieストア取得", {
    anonymousId: anonymousId ? "存在" : "なし",
    allCookies: cookieStore.getAll().map((c) => c.name),
  });

  // 認証を確認
  logDebug("confirmAuth関数呼び出し開始");
  const result = await confirmAuth({
    tokenHash: token_hash,
    code,
    type,
    anonymousId,
  });
  logDebug("confirmAuth関数結果", {
    success: result.success,
    redirectPath: result.redirectPath,
    error: result.error,
  });

  // 認証結果に基づいてリダイレクト
  if (result.success) {
    // 成功時は指定されたパスまたはデフォルトパスへリダイレクト
    const redirectTo = next || result.redirectPath || "/account";
    logDebug(`リダイレクト先: ${redirectTo}`);
    redirect(redirectTo);
  } else {
    // エラー時はログインページへリダイレクト
    const errorMessage = encodeURIComponent(result.error || "認証に失敗しました");
    logDebug(`エラーリダイレクト: /login?error=${errorMessage}`);
    redirect(`/login?error=${errorMessage}`);
  }
}
