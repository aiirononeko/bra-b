import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ProfileForm } from "../../components/auth/profile-form";
import { PasswordChangeForm } from "../../components/auth/password-change-form";
import { useAuthSession } from "../../hooks/use-auth";
import { isAuthenticated } from "../../lib/auth";

/**
 * アカウント設定ページのルート定義
 *
 * ユーザーがプロフィール編集やパスワード変更を行うための設定ページを提供する
 * 認証済みユーザーのみアクセス可能
 */
export const Route = createFileRoute("/_protected/settings")({
  component: SettingsPage,
  beforeLoad: async () => {
    // ログイン状態を確認
    const isLoggedIn = await isAuthenticated();
    if (!isLoggedIn) {
      throw redirect({ to: "/login" });
    }

    // メタデータの設定
    return {
      title: "アカウント設定 | BRA-B",
      description: "プロフィール編集やパスワード変更などのアカウント設定",
    };
  },
});

enum SettingsTab {
  PROFILE = "profile",
  PASSWORD = "password",
}

/**
 * アカウント設定ページコンポーネント
 *
 * ユーザーがプロフィール情報やパスワードを変更するためのインターフェースを提供する
 *
 * @returns アカウント設定ページのReactコンポーネント
 */
function SettingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SettingsTab>(SettingsTab.PROFILE);
  const { data: session } = useAuthSession();
  const user = session?.data?.user;

  /**
   * アクティブなタブを切り替える
   *
   * @param tab - 切り替えるタブ
   */
  const handleTabChange = (tab: SettingsTab) => {
    setActiveTab(tab);
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <main>
        <h1 className="text-3xl font-bold mb-8 text-center">アカウント設定</h1>

        {/* タブメニュー */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            type="button"
            className={`py-2 px-4 font-medium mr-4 ${
              activeTab === SettingsTab.PROFILE
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => handleTabChange(SettingsTab.PROFILE)}
            aria-selected={activeTab === SettingsTab.PROFILE}
            role="tab"
          >
            プロフィール編集
          </button>
          <button
            type="button"
            className={`py-2 px-4 font-medium ${
              activeTab === SettingsTab.PASSWORD
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => handleTabChange(SettingsTab.PASSWORD)}
            aria-selected={activeTab === SettingsTab.PASSWORD}
            role="tab"
          >
            パスワード変更
          </button>
        </div>

        {/* タブの内容 */}
        <div className="mt-6">
          {activeTab === SettingsTab.PROFILE && (
            <ProfileForm
              user={user}
              onSuccess={() => {
                // プロフィール更新成功時の処理
                // ここでは何もしない（成功メッセージはコンポーネント内で表示）
              }}
            />
          )}

          {activeTab === SettingsTab.PASSWORD && (
            <PasswordChangeForm
              onSuccess={() => {
                // パスワード変更成功時の処理
                // ここでは何もしない（成功メッセージはコンポーネント内で表示）
              }}
            />
          )}
        </div>

        {/* 戻るボタン */}
        <div className="mt-10 text-center">
          <button
            type="button"
            className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
            onClick={() => navigate({ to: "/dashboard" })}
            aria-label="ダッシュボードへ戻る"
          >
            ← ダッシュボードへ戻る
          </button>
        </div>
      </main>
    </div>
  );
}
