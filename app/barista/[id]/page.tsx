import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import FavoriteButtonContainer from "@/app/components/favorite-button-container";
import RecalculateCategoryButton from "@/app/components/recalculate-category-button";
import { fetchBaristaEvaluations } from "@/app/repositories/evaluation-repository";
import { fetchBaristaProfileById } from "@/app/repositories/profiles-repository";

// バリスタ詳細ページのパラメータの型定義
type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ auth_success?: string; message?: string }>;
};

// カテゴリの型定義
type BaristaCategory = {
  category: string;
  confidence_score: number;
  friendly_score: number;
  delicious_score: number;
  sophisticated_score: number;
  entertainer_score: number;
};

// カテゴリ名を日本語に変換する関数
const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    friendly: "フレンドリー",
    delicious: "美味しい一杯",
    sophisticated: "洗練された接客",
    entertainer: "エンターテイナー",
  };
  return labels[category] || category;
};

// カテゴリカラーを取得する関数
const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    friendly: "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200",
    delicious: "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200",
    sophisticated: "bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200",
    entertainer: "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200",
  };
  return colors[category] || "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200";
};

export default async function BaristaDetailPage({ params, searchParams }: Props) {
  // Next.js App Routerではparamsをawaitする必要がある
  const { id } = await params;

  // searchParamsをawaitする
  const parsedSearchParams = await searchParams;

  const { data: profile, error } = await fetchBaristaProfileById(id);

  // プロフィールが見つからない場合は404ページを表示
  if (error || !profile) {
    notFound();
  }

  // auth_successパラメータの確認
  const authSuccess = parsedSearchParams.auth_success === "true";
  const message = parsedSearchParams.message;

  // バリスタカテゴリ情報（信頼度が高い順に並べ替え）
  const categories = Array.isArray(profile.barista_categories)
    ? profile.barista_categories.sort(
        (a: BaristaCategory, b: BaristaCategory) => b.confidence_score - a.confidence_score
      )
    : profile.barista_categories
      ? [profile.barista_categories]
      : [];

  // 評価データを取得
  const { data: evaluations } = await fetchBaristaEvaluations(id);

  // 評価アイテムの出現頻度を集計
  const evaluationItemCounts: Record<string, number> = {};
  let totalEvaluations = 0;

  if (evaluations && evaluations.length > 0) {
    totalEvaluations = evaluations.length;
    for (const evaluation of evaluations) {
      if (evaluation.evaluation_details) {
        for (const detail of evaluation.evaluation_details) {
          const items = detail.evaluation_items;
          if (
            items &&
            typeof items === "object" &&
            "name" in items &&
            typeof items.name === "string"
          ) {
            evaluationItemCounts[items.name] = (evaluationItemCounts[items.name] || 0) + 1;
          }
        }
      }
    }
  }

  // 頻度順に並べ替え
  const topEvaluationItems = Object.entries(evaluationItemCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => ({ name, count, id: name })); // idを追加して一意のkeyとして使用

  return (
    <div className="container mx-auto px-4 py-8">
      {authSuccess && message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* プロフィール情報 */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="relative h-64 w-full bg-gray-200 dark:bg-gray-700">
              {profile.icon_url ? (
                <Image
                  src={profile.icon_url}
                  alt={profile.display_name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
                    className="w-16 h-16"
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
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-2">{profile.display_name}</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{profile.shop_name}</p>

              {/* バリスタカテゴリ表示 */}
              {categories.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {categories.map((category: BaristaCategory) => (
                      <span
                        key={category.category}
                        className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getCategoryColor(
                          category.category
                        )}`}
                      >
                        {getCategoryLabel(category.category)}
                      </span>
                    ))}
                  </div>
                  {/* 管理者のみに表示する場合はここで条件分岐 */}
                  <RecalculateCategoryButton baristaId={profile.id} />
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                {profile.sns_links?.instagram && (
                  <a
                    href={`https://instagram.com/${profile.sns_links.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-pink-500 hover:text-pink-700"
                  >
                    <span className="font-medium">Instagram</span>
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
                        d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                      />
                    </svg>
                  </a>
                )}
                {profile.sns_links?.twitter && (
                  <a
                    href={`https://twitter.com/${profile.sns_links.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-600"
                  >
                    <span className="font-medium">Twitter</span>
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
                        d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                      />
                    </svg>
                  </a>
                )}
              </div>

              <div className="mb-6 text-sm">
                <h2 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">自己紹介</h2>
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
                  {profile.bio}
                </p>
              </div>

              <button
                type="button"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full mb-4 transition-colors"
              >
                チップを送る
              </button>

              <FavoriteButtonContainer baristaProfileId={profile.id} />
            </div>
          </div>
        </div>

        {/* バリスタ評価情報 */}
        <div className="md:col-span-2">
          {/* カテゴリ詳細とスコア */}
          {categories.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">バリスタスキル分析</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {categories.map((category: BaristaCategory) => (
                  <div
                    key={category.category}
                    className={`rounded-lg p-4 ${getCategoryColor(category.category)}`}
                  >
                    <h3 className="text-lg font-medium mb-2">
                      {getCategoryLabel(category.category)}
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">信頼度</span>
                          <span className="text-sm font-medium">
                            {Math.round(category.confidence_score * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${Math.round(category.confidence_score * 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-xs">フレンドリー</span>
                            <span className="text-xs">
                              {Math.round(category.friendly_score * 10) / 10}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div
                              className="bg-yellow-500 h-1.5 rounded-full"
                              style={{ width: `${Math.min(category.friendly_score * 20, 100)}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-xs">美味しい一杯</span>
                            <span className="text-xs">
                              {Math.round(category.delicious_score * 10) / 10}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div
                              className="bg-green-500 h-1.5 rounded-full"
                              style={{ width: `${Math.min(category.delicious_score * 20, 100)}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-xs">洗練された接客</span>
                            <span className="text-xs">
                              {Math.round(category.sophisticated_score * 10) / 10}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div
                              className="bg-purple-500 h-1.5 rounded-full"
                              style={{
                                width: `${Math.min(category.sophisticated_score * 20, 100)}%`,
                              }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-xs">エンターテイナー</span>
                            <span className="text-xs">
                              {Math.round(category.entertainer_score * 10) / 10}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div
                              className="bg-blue-500 h-1.5 rounded-full"
                              style={{
                                width: `${Math.min(category.entertainer_score * 20, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">評価</h2>
              <Link href={`/evaluate/${profile.id}`}>
                <button
                  type="button"
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-1.5 px-4 rounded-full transition-colors text-sm"
                >
                  評価する
                </button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <h3 className="text-lg font-medium text-green-800 dark:text-green-200 mb-2">
                  注目の評価
                </h3>
                <div className="space-y-2">
                  {topEvaluationItems.length > 0 ? (
                    topEvaluationItems.map((item) => (
                      <div
                        key={item.id}
                        className="inline-block bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full px-3 py-1 text-sm mr-2 mb-2"
                      >
                        {item.name} ({item.count})
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">まだ評価がありません</p>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-2">
                  総合評価
                </h3>
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6 text-yellow-500"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="ml-2 text-lg font-semibold">{totalEvaluations}件の評価</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
