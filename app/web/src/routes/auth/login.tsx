import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";

import { LoginForm } from "../../components/auth/login-form";
import { isAuthenticated } from "../../lib/auth";

/**
 * ログインページのルート定義
 *
 * ユーザー認証のためのログインページを提供する
 * すでに認証済みの場合はダッシュボードにリダイレクトする
 */
export const Route = createFileRoute("/auth/login")({
  component: LoginPage,
  beforeLoad: async () => {
    // すでにログインしている場合はダッシュボードへリダイレクト
    const isLoggedIn = await isAuthenticated();
    if (isLoggedIn) {
      throw redirect({
        to: "/dashboard",
        // アクセシビリティの改善: スクリーンリーダー用のメッセージ
        replace: true,
      });
    }
    // メタデータの設定
    return {
      title: "ログイン | BRA-B",
      description: "バリスタ評価サービスBRA-Bへログイン",
    };
  },
});

/**
 * ログインページコンポーネント
 *
 * ユーザーがサービスにログインするためのインターフェースを提供する
 * ログイン成功時にダッシュボードにリダイレクト
 *
 * @returns ログインページのReactコンポーネント
 */
function LoginPage() {
  const navigate = useNavigate();

  /**
   * ログイン成功時のコールバック関数
   * ダッシュボードページに遷移
   */
  const handleLoginSuccess = () => {
    navigate({
      to: "/dashboard",
      replace: true,
    });
  };

  return (
    <div className="container mx-auto py-10">
      <main>
        <h1 className="text-2xl font-bold mb-6 text-center">ログイン</h1>
        <LoginForm onSuccess={handleLoginSuccess} />
      </main>
    </div>
  );
}
