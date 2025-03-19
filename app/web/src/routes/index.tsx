import { useQuery } from "@tanstack/react-query";
import { getBaristas } from "../lib/api";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

/**
 * バリスタ一覧ページ
 */
export function Index() {
  // バリスタ一覧データを取得
  const { data, isLoading, error } = useQuery({
    queryKey: ["baristas"],
    queryFn: getBaristas,
  });

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  if (error) {
    return <div>エラーが発生しました: {error.message}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">バリスタ一覧</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.baristas?.map((barista) => (
          <div
            key={barista.id}
            className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center mb-4">
              {barista.iconUrl ? (
                <img
                  src={barista.iconUrl}
                  alt={barista.displayName}
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}

              <div>
                <h2 className="text-xl font-semibold">{barista.displayName}</h2>
                {barista.shopName && <p className="text-gray-600">{barista.shopName}</p>}
              </div>
            </div>

            <Link
              to="/about"
              params={{ baristaId: barista.id }}
              className="block text-center py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              詳細を見る
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
