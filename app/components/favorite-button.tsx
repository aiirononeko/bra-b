"use client";

import { useEffect, useState } from "react";

type FavoriteButtonProps = {
  baristaProfileId: string;
  initialFavorite?: boolean;
  className?: string;
};

export default function FavoriteButton({
  baristaProfileId,
  initialFavorite = false,
  className = "",
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // コンポーネントマウント時にお気に入り状態を取得
  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      try {
        const response = await fetch(`/api/favorites?baristaProfileId=${baristaProfileId}`);
        const data = await response.json();

        if (response.ok) {
          setIsFavorite(data.isFavorite);
        } else {
          console.error("お気に入り状態の取得に失敗:", data.error);
        }
      } catch (err) {
        console.error("お気に入り状態の取得エラー:", err);
      }
    };

    fetchFavoriteStatus();
  }, [baristaProfileId]);

  // お気に入りトグル処理
  const toggleFavorite = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ baristaProfileId }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsFavorite(data.action === "add");
      } else {
        setError(data.error || "お気に入り操作に失敗しました");
        console.error("お気に入り登録エラー:", data.error);
      }
    } catch (err) {
      setError("サーバーとの通信に失敗しました");
      console.error("お気に入り操作エラー:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const buttonClassName = `
    ${className}
    flex items-center justify-center gap-1
    transition-all duration-300 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-blue-300
    disabled:opacity-50
  `;

  return (
    <>
      <button
        type="button"
        onClick={toggleFavorite}
        disabled={isLoading}
        className={buttonClassName}
        title={isFavorite ? "お気に入りから削除" : "お気に入りに追加"}
        aria-label={isFavorite ? "お気に入りから削除" : "お気に入りに追加"}
      >
        <div className="relative">
          {/* ハート アイコン */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={isFavorite ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.5"
            className={`w-5 h-5 ${
              isFavorite ? "text-red-500" : "text-gray-500 dark:text-gray-400"
            }`}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
            />
          </svg>

          {/* ローディングインジケータ */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-t-transparent border-blue-500 rounded-full animate-spin" />
            </div>
          )}
        </div>
        <span className="ml-1">{isFavorite ? "お気に入り済み" : "お気に入り"}</span>
      </button>

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </>
  );
}
