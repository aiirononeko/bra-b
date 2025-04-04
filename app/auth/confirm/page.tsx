import { confirmAuth } from "@/app/actions/auth";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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

  // 匿名IDを取得
  const cookieStore = await cookies();
  const anonymousId = cookieStore.get("anonymous_id")?.value || null;

  // 認証を確認
  const result = await confirmAuth({
    tokenHash: token_hash,
    code,
    type,
    anonymousId,
  });

  // 認証結果に基づいてリダイレクト
  if (result.success) {
    // 成功時は指定されたパスまたはデフォルトパスへリダイレクト
    const redirectTo = next || result.redirectPath || "/account";
    redirect(redirectTo);
  } else {
    // エラー時はログインページへリダイレクト
    const errorMessage = encodeURIComponent(result.error || "認証に失敗しました");
    redirect(`/login?error=${errorMessage}`);
  }
}
