import { createClient } from "@/utils/supabase/server";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import EvaluationForm from "../../components/evaluation-form";
import { fetchEvaluationItems } from "../../repositories/evaluation-repository";
import { fetchBaristaProfileById } from "../../repositories/profiles-repository";

// バリスタ評価ページのパラメータの型定義
type Props = {
  params: Promise<{ id: string }>;
  searchParams: { message?: string; success?: string };
};

export default async function EvaluateBaristaPage({ params, searchParams }: Props) {
  // Next.js App Routerではparamsをawaitする必要がある
  const { id } = await params;

  const { data: profile, error } = await fetchBaristaProfileById(id);

  // プロフィールが見つからない場合は404ページを表示
  if (error || !profile) {
    notFound();
  }

  // 評価項目を取得
  const { data: evaluationItems } = await fetchEvaluationItems();

  // サーバーサイドでユーザー情報を取得
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 認証情報を保持
  const authStatus = {
    isLoggedIn: !!user,
    userId: user?.id || "",
  };

  // 結果メッセージがあれば取得
  const message = searchParams.message;
  const success = searchParams.success === "true";

  return (
    <div className="container mx-auto px-4 py-8">
      {message && (
        <div
          className={`mb-6 p-4 rounded-md ${
            success
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message}
        </div>
      )}

      <div className="mb-4">
        <Link href="/" className="text-blue-500 hover:text-blue-700 flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-4 h-4"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>
          トップページに戻る
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="bg-blue-600 dark:bg-blue-800 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">バリスタ評価</h1>
          <p className="text-blue-100">
            {profile.display_name}さんの評価を行います。当てはまる項目を選択してください。
          </p>
        </div>

        <div className="p-6">
          {/* バリスタ情報 */}
          <div className="flex items-center mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden relative mr-4">
              {profile.icon_url ? (
                <Image
                  src={profile.icon_url}
                  alt={profile.display_name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-8 h-8"
                    aria-labelledby="profileAvatarTitle"
                  >
                    <title id="profileAvatarTitle">プロフィール画像</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                    />
                  </svg>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold">{profile.display_name}</h2>
              <p className="text-gray-600 dark:text-gray-400">{profile.shop_name}</p>
            </div>
          </div>

          {/* 評価フォーム */}
          <EvaluationForm
            baristaId={id}
            evaluationItems={evaluationItems || []}
            authStatus={authStatus}
          />
        </div>
      </div>
    </div>
  );
}
