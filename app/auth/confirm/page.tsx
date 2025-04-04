import { confirmAuth } from "@/app/actions/auth";
import { createClient } from "@/utils/supabase/server";
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
    code: code ? "存在・長さ:" + code.length : "なし",
    type,
    next,
  });

  // 匿名IDを取得
  const cookieStore = await cookies();
  const anonymousId = cookieStore.get("anonymous_id")?.value || null;

  // すべてのCookieを取得して詳細を記録
  const allCookies = cookieStore.getAll();
  logDebug("Cookieストア取得", {
    anonymousId: anonymousId ? "存在" : "なし",
    cookieCount: allCookies.length,
    cookieNames: allCookies.map((c) => c.name),
    authCookies: allCookies
      .filter((c) => c.name.includes("auth"))
      .map((c) => ({
        name: c.name,
        path: c.path,
        domain: c.domain || "ドメイン指定なし",
      })),
  });

  // 認証前のセッション状態を確認
  try {
    const supabase = await createClient();
    const { data: sessionData } = await supabase.auth.getSession();

    logDebug("認証前のセッション状態", {
      hasSession: !!sessionData.session,
      userId: sessionData.session?.user?.id,
      expiresAt: sessionData.session?.expires_at,
      accessToken: sessionData.session?.access_token
        ? "存在・長さ:" + sessionData.session.access_token.length
        : "なし",
    });
  } catch (sessionError) {
    logDebug("認証前のセッション確認エラー", { error: sessionError });
  }

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
    baseUrl: result.baseUrl,
  });

  // 認証後のセッション状態を再確認
  try {
    const supabase = await createClient();
    const { data: sessionData } = await supabase.auth.getSession();

    logDebug("認証後のセッション状態", {
      hasSession: !!sessionData.session,
      userId: sessionData.session?.user?.id,
      expiresAt: sessionData.session?.expires_at,
      accessToken: sessionData.session?.access_token
        ? "存在・長さ:" + sessionData.session.access_token.length
        : "なし",
    });

    // 認証後のCookieを再確認
    const afterCookies = (await cookies()).getAll();
    logDebug("認証後のCookie状態", {
      cookieCount: afterCookies.length,
      cookieNames: afterCookies.map((c) => c.name),
      authCookies: afterCookies
        .filter((c) => c.name.includes("auth"))
        .map((c) => ({
          name: c.name,
          path: c.path,
          domain: c.domain || "ドメイン指定なし",
        })),
    });
  } catch (sessionError) {
    logDebug("認証後のセッション確認エラー", { error: sessionError });
  }

  // 認証結果に基づいてリダイレクト
  if (result.success) {
    // 成功時は指定されたパスまたはデフォルトパスへリダイレクト
    const redirectTo = next || result.redirectPath || "/account";
    logDebug(`リダイレクト先: ${redirectTo}`, {
      originalNext: next,
      resultPath: result.redirectPath,
      finalUrl: redirectTo,
    });
    redirect(redirectTo);
  } else {
    // エラー時はログインページへリダイレクト
    const errorMessage = encodeURIComponent(result.error || "認証に失敗しました");
    logDebug(`エラーリダイレクト: /login?error=${errorMessage}`, {
      error: result.error,
    });
    redirect(`/login?error=${errorMessage}`);
  }
}
