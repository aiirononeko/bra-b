import { exchangeCodeForSession, verifyOtp } from "@/app/actions/auth";
import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest, NextResponse } from "next/server";

// Creating a handler to a GET request to route /auth/confirm
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // OTP検証に必要なパラメータの取得
  const token_hash = searchParams.get("token_hash");
  const code = searchParams.get("code"); // メールリンクから送られてくるcodeパラメータも対応
  const type = searchParams.get("type") || "email";

  // リダイレクト先を設定（不正な場合はerrorに進む）
  const next = searchParams.get("next") || "/";

  // Create redirect link without the secret token
  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = next;
  redirectTo.searchParams.delete("token_hash");
  redirectTo.searchParams.delete("code");
  redirectTo.searchParams.delete("type");

  let verifyResult = { success: false };

  // token_hashがある場合はその検証を試みる
  if (token_hash && type) {
    verifyResult = await verifyOtp(type, token_hash);
  }
  // codeがある場合はセッションの検証を試みる
  else if (code) {
    verifyResult = await exchangeCodeForSession(code);
  }

  // 検証が成功した場合はリダイレクト先へ
  if (verifyResult.success) {
    redirectTo.searchParams.delete("next");
    return NextResponse.redirect(redirectTo);
  }

  // return the user to an error page with some instructions
  redirectTo.pathname = "/error";
  return NextResponse.redirect(redirectTo);
}
