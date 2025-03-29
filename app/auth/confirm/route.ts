import type { EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

// Creating a handler to a GET request to route /auth/confirm
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // OTP検証に必要なパラメータの取得
  const token_hash = searchParams.get("token_hash");
  const code = searchParams.get("code"); // メールリンクから送られてくるcodeパラメータも対応
  const type = (searchParams.get("type") as EmailOtpType | null) || "email";

  // リダイレクト先を設定（不正な場合はerrorに進む）
  const next = searchParams.get("next") || "/";

  // Create redirect link without the secret token
  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = next;
  redirectTo.searchParams.delete("token_hash");
  redirectTo.searchParams.delete("code");
  redirectTo.searchParams.delete("type");

  const supabase = await createClient();
  let verifyError = null;

  // token_hashがある場合はその検証を試みる
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    verifyError = error;
  }
  // codeがある場合はセッションの検証を試みる
  else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    verifyError = error;
  }

  // 検証が成功した場合はリダイレクト先へ
  if (!verifyError) {
    redirectTo.searchParams.delete("next");
    return NextResponse.redirect(redirectTo);
  }

  // return the user to an error page with some instructions
  redirectTo.pathname = "/error";
  return NextResponse.redirect(redirectTo);
}
