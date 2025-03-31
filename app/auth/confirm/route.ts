import { type NextRequest, NextResponse } from "next/server";

import { exchangeCodeForSession, verifyOtp } from "@/app/actions/auth";
import { createClient } from "@/utils/supabase/server";

// Creating a handler to a GET request to route /auth/confirm
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // OTP検証に必要なパラメータの取得
  const token_hash = searchParams.get("token_hash");
  // Supabaseでは、codeまたはtokenという名前でパラメータが送信される場合がある
  const code = searchParams.get("code") || searchParams.get("token");
  const type = searchParams.get("type") || "email";

  // リダイレクト先を設定（不正な場合はerrorに進む）
  const next = searchParams.get("next") || "/account";

  // Create redirect link without the secret token
  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = next;
  redirectTo.searchParams.delete("token_hash");
  redirectTo.searchParams.delete("code");
  redirectTo.searchParams.delete("type");

  let verifyResult = { success: false };

  try {
    // token_hashがある場合はその検証を試みる
    if (token_hash && type) {
      verifyResult = await verifyOtp(type, token_hash);
    }
    // codeがある場合はセッションの検証を試みる
    else if (code) {
      verifyResult = await exchangeCodeForSession(code);
    } else {
      console.error("No valid verification parameters found");
    }
  } catch (error) {
    console.error("Error during verification:", error);
  }

  // 検証が成功した場合
  if (verifyResult.success) {
    // ユーザータイプを取得
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // リダイレクト先をアカウントページに設定
    const accountRedirect = request.nextUrl.clone();
    accountRedirect.pathname = "/account";

    // ユーザータイプがバリスタの場合はバリスタページへ
    if (user?.user_metadata?.user_type === "barista") {
      // バリスタページにリダイレクト（バリスタIDがあれば使用）
      if (user.id) {
        accountRedirect.pathname = `/barista/${user.id}`;
      } else {
        accountRedirect.pathname = "/account";
      }
    }

    // 成功メッセージを追加
    accountRedirect.searchParams.set("auth_success", "true");
    accountRedirect.searchParams.set("message", "認証に成功しました。ログインしました。");

    return NextResponse.redirect(accountRedirect);
  }

  // return the user to an error page with some instructions
  redirectTo.pathname = "/error";
  return NextResponse.redirect(redirectTo);
}
