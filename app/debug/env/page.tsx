import { createClient } from "@/utils/supabase/server";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "環境変数デバッグ",
  description: "環境変数の確認ページ",
};

export default async function DebugEnvPage() {
  // ヘッダー情報を取得
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const userAgent = headersList.get("user-agent") || "";
  const referer = headersList.get("referer") || "";

  // Cookie情報を取得
  const cookiesList = await cookies();
  const allCookies = cookiesList.getAll();

  // セッション情報を取得
  let sessionInfo: { hasSession: boolean; userId: string | null; email: string | null } = {
    hasSession: false,
    userId: null,
    email: null,
  };

  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      sessionInfo = {
        hasSession: true,
        userId: session.user?.id || null,
        email: session.user?.email || null,
      };
    }
  } catch (e) {
    console.error("セッション取得エラー", e);
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">環境変数デバッグ</h1>

      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="text-xl font-semibold mb-2">サーバー情報</h2>
        <div className="bg-white p-2 rounded shadow mb-2">
          <div className="font-bold">ホスト</div>
          <div className="text-sm break-all">{host}</div>
        </div>
        <div className="bg-white p-2 rounded shadow mb-2">
          <div className="font-bold">リファラー</div>
          <div className="text-sm break-all">{referer || "(なし)"}</div>
        </div>
        <div className="bg-white p-2 rounded shadow">
          <div className="font-bold">User Agent</div>
          <div className="text-sm break-all">{userAgent}</div>
        </div>
      </div>

      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="text-xl font-semibold mb-2">セッション情報</h2>
        <div className="bg-white p-2 rounded shadow">
          <div className="font-bold">ログインステータス</div>
          <div className="text-sm break-all">
            {sessionInfo.hasSession ? `ログイン中 (${sessionInfo.email})` : "未ログイン"}
          </div>
          {sessionInfo.hasSession && (
            <div className="mt-2">
              <div className="font-bold">ユーザーID</div>
              <div className="text-sm break-all">{sessionInfo.userId}</div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="text-xl font-semibold mb-2">公開環境変数</h2>
        <div className="grid grid-cols-1 gap-2">
          {Object.entries(process.env)
            .filter(([key]) => key.startsWith("NEXT_PUBLIC_"))
            .map(([key, value]) => (
              <div key={key} className="bg-white p-2 rounded shadow">
                <div className="font-bold">{key}</div>
                <div className="text-sm break-all">{value || "(未設定)"}</div>
              </div>
            ))}
        </div>
      </div>

      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="text-xl font-semibold mb-2">Cookie情報</h2>
        <div className="bg-white p-2 rounded shadow mb-2">
          <div className="font-bold">Cookie数</div>
          <div className="text-sm">{allCookies.length}</div>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {allCookies.map((cookie) => (
            <div key={cookie.name} className="bg-white p-2 rounded shadow">
              <div className="font-bold">{cookie.name}</div>
              <div className="text-xs text-gray-500">値の長さ: {cookie.value.length}文字</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm text-gray-600">
          注意: この情報はクライアントサイドに公開されている環境変数のみを表示しています。
          NEXT_PUBLIC_ プレフィックスのない環境変数はセキュリティのため表示されません。
        </p>
      </div>
    </div>
  );
}
