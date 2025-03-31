"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { createClient } from "@/utils/supabase/client";

export default function EditProfile() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [website, setWebsite] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    async function getProfile() {
      try {
        setLoading(true);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, username, website, avatar_url")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error(error);
          setMessage({ text: "プロフィール情報の取得に失敗しました", type: "error" });
        } else if (data) {
          setFullName(data.full_name || "");
          setUsername(data.username || "");
          setWebsite(data.website || "");
          setAvatarUrl(data.avatar_url || "");
        }
      } catch (error) {
        console.error("プロフィール取得エラー:", error);
        setMessage({ text: "エラーが発生しました", type: "error" });
      } finally {
        setLoading(false);
      }
    }

    getProfile();
  }, [router, supabase]);

  async function updateProfile() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const updates = {
        id: user.id,
        full_name: fullName,
        username,
        website,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("profiles").upsert(updates);

      if (error) {
        console.error(error);
        setMessage({ text: "プロフィールの更新に失敗しました", type: "error" });
      } else {
        setMessage({ text: "プロフィールを更新しました", type: "success" });
        // 少し待ってからアカウントページに戻る
        setTimeout(() => router.push("/account"), 1500);
      }
    } catch (error) {
      console.error("更新エラー:", error);
      setMessage({ text: "エラーが発生しました", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {/* ヘッダー部分 */}
        <div className="bg-blue-600 dark:bg-blue-800 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">プロフィール編集</h1>
          <p className="text-blue-100">アカウント情報を更新する</p>
        </div>

        <div className="p-6">
          {message.text && (
            <div
              className={`mb-6 p-4 rounded-md ${message.type === "error" ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200" : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"}`}
            >
              {message.text}
            </div>
          )}

          <div className="space-y-6">
            {/* アバター画像（将来的に実装予定） */}
            <div className="flex items-center justify-center">
              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt="プロフィール画像" fill className="object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-3xl text-gray-500">
                      {fullName?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* フォーム */}
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  名前
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  placeholder="例: 田中太郎"
                />
              </div>

              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  ユーザー名
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  placeholder="例: taro_tanaka"
                />
              </div>

              <div>
                <label
                  htmlFor="website"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  ウェブサイト
                </label>
                <input
                  id="website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  placeholder="例: https://example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="avatar"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  プロフィール画像URL
                </label>
                <input
                  id="avatar"
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  placeholder="例: https://example.com/avatar.jpg"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  画像のURLを入力してください
                </p>
              </div>
            </div>

            {/* ボタン */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
              <button
                type="button"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={updateProfile}
                disabled={loading}
              >
                {loading ? "更新中..." : "プロフィールを更新"}
              </button>

              <Link
                href="/account"
                className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                キャンセル
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
