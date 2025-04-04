import {
  type AdminEvaluationHistory,
  fetchAllEvaluationsForAdmin,
} from "@/app/repositories/evaluation-repository";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

// カテゴリ名を日本語に変換する関数
const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    friendly: "フレンドリー",
    delicious: "美味しい一杯",
    sophisticated: "洗練されたサービス",
    entertainer: "エンターテイナー",
  };
  return labels[category] || category;
};

// カテゴリカラーを取得する関数
const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    friendly: "bg-yellow-100 text-yellow-800",
    delicious: "bg-green-100 text-green-800",
    sophisticated: "bg-purple-100 text-purple-800",
    entertainer: "bg-blue-100 text-blue-800",
  };
  return colors[category] || "bg-gray-100 text-gray-800";
};

export default async function AdminDashboardPage() {
  // 認証チェック
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // ログインしていない場合はログインページへリダイレクト
    redirect("/login?message=ダッシュボードにアクセスするにはログインが必要です");
  }

  // 管理者権限チェック (例えば管理者のプロフィールタイプが'admin'の場合)
  const { data: profile } = await supabase
    .from("profiles")
    .select("type")
    .eq("user_id", user.id)
    .single();

  if (!profile || profile.type !== "admin") {
    // 管理者でない場合は404ページを表示
    notFound();
  }

  // すべての評価履歴を取得
  const { data: evaluationsData, error } = await fetchAllEvaluationsForAdmin();
  // 型安全のために明示的に型変換
  const evaluations = evaluationsData as AdminEvaluationHistory[] | null;

  if (error) {
    console.error("評価履歴の取得エラー:", error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">管理者ダッシュボード</h1>
        <p className="text-gray-600 dark:text-gray-400">
          バリスタの評価履歴とカテゴライズ結果を確認できます
        </p>
      </div>

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

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">評価履歴</h2>

        {evaluations && evaluations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    日時
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    バリスタ
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    評価者
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    評価項目
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    カテゴリ
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    スコア
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {evaluations.map((evaluation) => {
                  // バリスタカテゴリ情報を取得
                  const baristaCategories = evaluation.barista_profile.barista_categories;
                  const category = baristaCategories
                    ? Array.isArray(baristaCategories) && baristaCategories.length > 0
                      ? baristaCategories[0]
                      : baristaCategories
                    : null;

                  // 評価項目名の配列を作成
                  const itemNames = evaluation.evaluation_details
                    .map((detail) => detail.evaluation_items?.name)
                    .filter(Boolean);

                  return (
                    <tr key={evaluation.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(evaluation.evaluated_at).toLocaleString("ja-JP")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {evaluation.barista_profile.display_name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {evaluation.barista_profile.shop_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {evaluation.evaluator.display_name}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {itemNames.map((name, index) => (
                            <span
                              key={`${evaluation.id}-item-${index}`}
                              className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                            >
                              {name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {category?.category ? (
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getCategoryColor(
                              category.category
                            )}`}
                          >
                            {getCategoryLabel(category.category)}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">未分類</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {category ? (
                          <div className="space-y-1 w-32">
                            <div className="flex justify-between text-xs">
                              <span>フレンドリー</span>
                              <span>{Math.round(category.friendly_score * 10) / 10}</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                              <div
                                className="bg-yellow-500 h-1 rounded-full"
                                style={{
                                  width: `${Math.min(category.friendly_score * 20, 100)}%`,
                                }}
                              />
                            </div>

                            <div className="flex justify-between text-xs">
                              <span>美味しい一杯</span>
                              <span>{Math.round(category.delicious_score * 10) / 10}</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                              <div
                                className="bg-green-500 h-1 rounded-full"
                                style={{
                                  width: `${Math.min(category.delicious_score * 20, 100)}%`,
                                }}
                              />
                            </div>

                            <div className="flex justify-between text-xs">
                              <span>洗練された</span>
                              <span>{Math.round(category.sophisticated_score * 10) / 10}</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                              <div
                                className="bg-purple-500 h-1 rounded-full"
                                style={{
                                  width: `${Math.min(category.sophisticated_score * 20, 100)}%`,
                                }}
                              />
                            </div>

                            <div className="flex justify-between text-xs">
                              <span>エンターテイナー</span>
                              <span>{Math.round(category.entertainer_score * 10) / 10}</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                              <div
                                className="bg-blue-500 h-1 rounded-full"
                                style={{
                                  width: `${Math.min(category.entertainer_score * 20, 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            データなし
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md text-center">
            <p className="text-gray-500 dark:text-gray-400">
              {error ? "評価データの読み込みに失敗しました" : "評価データがありません"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
