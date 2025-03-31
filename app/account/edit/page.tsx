"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { baristaProfileSchema } from "@/app/lib/schemas/auth-schemas";
import type { BaristaProfileFormValues } from "@/app/lib/schemas/auth-schemas";
import { createClient } from "@/utils/supabase/client";

// 都道府県リスト
const PREFECTURES = [
  "北海道",
  "青森県",
  "岩手県",
  "宮城県",
  "秋田県",
  "山形県",
  "福島県",
  "茨城県",
  "栃木県",
  "群馬県",
  "埼玉県",
  "千葉県",
  "東京都",
  "神奈川県",
  "新潟県",
  "富山県",
  "石川県",
  "福井県",
  "山梨県",
  "長野県",
  "岐阜県",
  "静岡県",
  "愛知県",
  "三重県",
  "滋賀県",
  "京都府",
  "大阪府",
  "兵庫県",
  "奈良県",
  "和歌山県",
  "鳥取県",
  "島根県",
  "岡山県",
  "広島県",
  "山口県",
  "徳島県",
  "香川県",
  "愛媛県",
  "高知県",
  "福岡県",
  "佐賀県",
  "長崎県",
  "熊本県",
  "大分県",
  "宮崎県",
  "鹿児島県",
  "沖縄県",
];

export default function EditBaristaProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: string } | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BaristaProfileFormValues>({
    resolver: zodResolver(baristaProfileSchema),
    defaultValues: {
      displayName: "",
      shopName: "",
      bio: "",
      yearsOfExperience: undefined,
      googleMapsLink: "",
      prefecture: "",
      snsLinks: {
        instagram: "",
        twitter: "",
      },
    },
  });

  // プロフィール情報の取得
  useEffect(() => {
    async function getProfile() {
      try {
        setLoading(true);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/auth/login");
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error(error);
          setMessage({ text: "プロフィール情報の取得に失敗しました", type: "error" });
        } else if (data) {
          setValue("displayName", data.display_name || "");
          setValue("shopName", data.shop_name || "");
          setValue("bio", data.bio || "");
          setValue("yearsOfExperience", data.years_of_experience || undefined);
          setValue("googleMapsLink", data.google_maps_link || "");
          setValue("prefecture", data.prefecture || "");

          if (data.sns_links) {
            setValue("snsLinks.instagram", data.sns_links.instagram || "");
            setValue("snsLinks.twitter", data.sns_links.twitter || "");
          }

          setAvatarUrl(data.icon_url);
        }
      } catch (error) {
        console.error("プロフィール取得エラー:", error);
        setMessage({ text: "エラーが発生しました", type: "error" });
      } finally {
        setLoading(false);
      }
    }

    getProfile();
  }, [router, supabase, setValue]);

  // プロフィール更新
  const onSubmit = async (data: BaristaProfileFormValues) => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        user_id: user.id,
        type: "barista",
        display_name: data.displayName,
        shop_name: data.shopName || null,
        bio: data.bio || null,
        years_of_experience: data.yearsOfExperience || null,
        google_maps_link: data.googleMapsLink || null,
        prefecture: data.prefecture || null,
        sns_links: data.snsLinks || null,
        updated_at: new Date().toISOString(),
      });

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
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {/* ヘッダー部分 */}
        <div className="bg-blue-600 dark:bg-blue-800 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">バリスタプロフィール編集</h1>
          <p className="text-blue-100">あなたのプロフィール情報を更新してください</p>
        </div>

        <div className="p-6">
          {message && (
            <div
              className={`mb-6 p-4 rounded-md ${
                message.type === "error"
                  ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-200"
                  : "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* アバター画像（将来的に実装予定） */}
            <div className="flex items-center justify-center">
              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt="プロフィール画像" fill className="object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-gray-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-10 h-10"
                        aria-labelledby="avatarIconTitle"
                      >
                        <title id="avatarIconTitle">プロフィールアイコン</title>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                        />
                      </svg>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 基本情報 */}
            <div>
              <h2 className="text-lg font-semibold mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
                基本情報
              </h2>
              <div className="space-y-4">
                {/* 名前 */}
                <div>
                  <label
                    htmlFor="displayName"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    名前 <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="displayName"
                    type="text"
                    {...register("displayName")}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    placeholder="例: コーヒー太郎"
                  />
                  {errors.displayName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.displayName.message}
                    </p>
                  )}
                </div>

                {/* 所属店舗名 */}
                <div>
                  <label
                    htmlFor="shopName"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    所属店舗名
                  </label>
                  <input
                    id="shopName"
                    type="text"
                    {...register("shopName")}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    placeholder="例: カフェ ブレインストーム"
                  />
                  {errors.shopName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.shopName.message}
                    </p>
                  )}
                </div>

                {/* バリスタ歴 */}
                <div>
                  <label
                    htmlFor="yearsOfExperience"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    バリスタ歴（年）
                  </label>
                  <input
                    id="yearsOfExperience"
                    type="number"
                    {...register("yearsOfExperience", { valueAsNumber: true })}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    placeholder="例: 3"
                  />
                  {errors.yearsOfExperience && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.yearsOfExperience.message}
                    </p>
                  )}
                </div>

                {/* 都道府県 */}
                <div>
                  <label
                    htmlFor="prefecture"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    都道府県
                  </label>
                  <select
                    id="prefecture"
                    {...register("prefecture")}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  >
                    <option value="">選択してください</option>
                    {PREFECTURES.map((pref) => (
                      <option key={pref} value={pref}>
                        {pref}
                      </option>
                    ))}
                  </select>
                  {errors.prefecture && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.prefecture.message}
                    </p>
                  )}
                </div>

                {/* Googleマップリンク */}
                <div>
                  <label
                    htmlFor="googleMapsLink"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Google マップリンク
                  </label>
                  <input
                    id="googleMapsLink"
                    type="url"
                    {...register("googleMapsLink")}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    placeholder="例: https://maps.google.com/..."
                  />
                  {errors.googleMapsLink && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.googleMapsLink.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 自己紹介 */}
            <div>
              <h2 className="text-lg font-semibold mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
                自己紹介
              </h2>
              <div>
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  自己紹介文
                </label>
                <textarea
                  id="bio"
                  {...register("bio")}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  placeholder="あなたのバリスタとしての経歴や特徴を書いてください"
                />
                {errors.bio && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.bio.message}
                  </p>
                )}
              </div>
            </div>

            {/* SNSリンク */}
            <div>
              <h2 className="text-lg font-semibold mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
                SNSリンク
              </h2>
              <div className="space-y-4">
                {/* Instagram */}
                <div>
                  <label
                    htmlFor="instagram"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Instagram
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                      @
                    </span>
                    <input
                      id="instagram"
                      type="text"
                      {...register("snsLinks.instagram")}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                      placeholder="ユーザーID（例: coffee_master）"
                    />
                  </div>
                </div>

                {/* Twitter */}
                <div>
                  <label
                    htmlFor="twitter"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Twitter
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                      @
                    </span>
                    <input
                      id="twitter"
                      type="text"
                      {...register("snsLinks.twitter")}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                      placeholder="ユーザーID（例: coffee_master）"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 送信ボタン */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          </form>
        </div>
      </div>
    </div>
  );
}
