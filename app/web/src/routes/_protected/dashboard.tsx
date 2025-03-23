import { createFileRoute, redirect } from "@tanstack/react-router";

import { useAuthSession, useSignOut } from "../../hooks/use-auth";
import { isAuthenticated } from "../../lib/auth";

export const Route = createFileRoute("/_protected/dashboard")({
  component: DashboardPage,
  beforeLoad: async () => {
    // ログイン状態を確認
    const isLoggedIn = await isAuthenticated();
    if (!isLoggedIn) {
      throw redirect({ to: "/login" });
    }

    // メタデータの設定
    return {
      title: "ダッシュボード | ブラービ",
      description: "",
    };
  },
});

function DashboardPage() {
  const { data: session } = useAuthSession();
  const { mutate: signOut } = useSignOut();

  return (
    <div className="container mx-auto py-10">
      <div className="bg-white shadow-md rounded p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">ダッシュボード</h1>
          <button
            type="button"
            onClick={() => signOut()}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            ログアウト
          </button>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-2">ユーザー情報</h2>
          <p>
            <span className="font-medium">名前:</span> {session?.data?.user?.name}
          </p>
          <p>
            <span className="font-medium">メール:</span> {session?.data?.user?.email}
          </p>
        </div>
      </div>
    </div>
  );
}
