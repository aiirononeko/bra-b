import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "環境変数デバッグ",
  description: "環境変数の確認ページ",
};

export default function DebugEnvPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">環境変数デバッグ</h1>

      <div className="bg-gray-100 p-4 rounded">
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

      <div className="mt-4">
        <p className="text-sm text-gray-600">
          注意: この情報はクライアントサイドに公開されている環境変数のみを表示しています。
          NEXT_PUBLIC_ プレフィックスのない環境変数はセキュリティのため表示されません。
        </p>
      </div>
    </div>
  );
}
