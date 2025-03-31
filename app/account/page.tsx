import { signOut } from "@/app/actions/auth";
import { createClient } from "@/utils/supabase/server";
import Image from "next/image";
import Link from "next/link";
import QRCode from "react-qr-code";

export default async function Account() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // プロフィール情報を取得
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, username, website, avatar_url")
    .eq("id", user?.id)
    .single();

  // 基本情報
  const userEmail = user?.email || "";
  const displayName =
    profile?.full_name ||
    profile?.username ||
    (userEmail ? userEmail.split("@")[0] : "") ||
    "ユーザー";
  const userType = user?.user_metadata?.user_type === "barista" ? "バリスタ" : "カスタマー";

  // バリスタ評価用のQRコードURL
  const isBarista = user?.user_metadata?.user_type === "barista";
  const evaluationUrl = isBarista
    ? `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5555"}/evaluate/${user?.id}`
    : "";

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {/* ヘッダー部分 */}
        <div className="bg-blue-600 dark:bg-blue-800 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">マイアカウント</h1>
          <p className="text-blue-100">{userType}として登録されています</p>
        </div>

        <div className="md:flex">
          {/* プロフィール情報 */}
          <div className="md:w-1/3 p-6 border-r border-gray-200 dark:border-gray-700">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4 relative">
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={`${displayName}のプロフィール画像`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-4xl text-gray-500">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <h2 className="text-xl font-semibold mb-1">{displayName}</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{userEmail}</p>

              {profile?.website && (
                <a
                  href={
                    profile.website.startsWith("http")
                      ? profile.website
                      : `https://${profile.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <title>ウェブサイトアイコン</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  ウェブサイト
                </a>
              )}
            </div>

            {/* 各種リンク */}
            <div className="mt-8 space-y-2">
              <Link
                href="/"
                className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <title>ホームアイコン</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                ホームに戻る
              </Link>
              {user?.user_metadata?.user_type === "barista" && user.id && (
                <Link
                  href={`/barista/${user.id}`}
                  className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <title>プロフィールアイコン</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  バリスタプロフィールを表示
                </Link>
              )}
              <div className="pt-4">
                <form action={signOut}>
                  <button
                    type="submit"
                    className="flex items-center text-red-600 hover:text-red-800"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <title>ログアウトアイコン</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    ログアウト
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* ユーザー情報表示 */}
          <div className="md:w-2/3 p-6">
            <h3 className="text-xl font-semibold mb-6">アカウント情報</h3>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  メールアドレス
                </h4>
                <p className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                  {userEmail}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  ユーザータイプ
                </h4>
                <p className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                  {userType}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  登録日
                </h4>
                <p className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString("ja-JP")
                    : "情報なし"}
                </p>
              </div>

              {isBarista && (
                <div className="pt-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    評価QRコード
                  </h4>
                  <div className="bg-white p-4 rounded-lg flex flex-col items-center">
                    <div className="mb-2">
                      <QRCode value={evaluationUrl} size={180} />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                      このQRコードをカスタマーに読み取ってもらうことで、あなたの評価を受け取ることができます。
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-6">
                <Link
                  href="/account/edit"
                  className="inline-flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <title>編集アイコン</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  プロフィールを編集
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
