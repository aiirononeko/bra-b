"use client";

import { useState } from "react";
import { recalculateBaristaCategoryAction } from "../actions/evaluation";

interface RecalculateCategoryButtonProps {
  baristaId: string;
}

export default function RecalculateCategoryButton({ baristaId }: RecalculateCategoryButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleRecalculate = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      setMessage(null);

      const result = await recalculateBaristaCategoryAction(baristaId);

      if (result.error) {
        setMessage({
          text: `エラー: ${result.error}`,
          type: "error",
        });
      } else {
        setMessage({
          text: `カテゴリを更新しました: ${result.category || ""}`,
          type: "success",
        });

        // 1秒後にページをリロード
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      setMessage({
        text: "カテゴリ更新中にエラーが発生しました",
        type: "error",
      });
      console.error("カテゴリ更新エラー:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={handleRecalculate}
        disabled={isLoading}
        className="text-sm bg-blue-500 hover:bg-blue-600 text-white font-medium py-1 px-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "計算中..." : "カテゴリを再計算"}
      </button>

      {message && (
        <div
          className={`mt-2 text-sm p-2 rounded ${
            message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
