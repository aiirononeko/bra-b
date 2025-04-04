"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createEvaluation } from "../actions/evaluation";
import type { EvaluationFormData } from "../lib/schemas/evaluation-schemas";
import type { EvaluationItem } from "../repositories/evaluation-repository";

type EvaluationFormProps = {
  baristaId: string;
  evaluationItems: EvaluationItem[];
  authStatus: {
    isLoggedIn: boolean;
    userId: string;
  };
};

export default function EvaluationForm({
  baristaId,
  evaluationItems,
  authStatus,
}: EvaluationFormProps) {
  const router = useRouter();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleItemClick = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      alert("少なくとも1つの評価項目を選択してください。");
      return;
    }

    setSubmitting(true);

    try {
      // 未認証ユーザーの場合はログインページに遷移
      if (!authStatus.isLoggedIn) {
        router.push(
          `/login?message=${encodeURIComponent("評価を送信するにはログインが必要です。")}`
        );
        return;
      }

      // ログインしている場合は評価を送信
      const evaluationData: EvaluationFormData = {
        baristaId,
        userId: authStatus.userId,
        selectedItems,
      };

      const result = await createEvaluation(evaluationData);

      if (result.error) {
        router.push(
          `/evaluate/${baristaId}?message=${encodeURIComponent(
            result.error || "評価の送信中にエラーが発生しました。"
          )}&success=false`
        );
      } else {
        router.push(
          `/evaluate/${baristaId}?message=${encodeURIComponent(
            "評価を送信しました。ありがとうございます！"
          )}&success=true`
        );
      }
    } catch (error) {
      console.error("評価送信エラー:", error);
      router.push(
        `/evaluate/${baristaId}?message=${encodeURIComponent(
          "評価の送信中にエラーが発生しました。"
        )}&success=false`
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">バリスタを評価する</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        以下の項目から、このバリスタの特徴に当てはまるものを選択してください。 複数選択可能です。
      </p>

      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {evaluationItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleItemClick(item.id)}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                selectedItems.includes(item.id)
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col space-y-4">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "送信中..." : "評価を送信する"}
        </button>

        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          {authStatus.isLoggedIn
            ? "評価を送信すると、このバリスタのプロフィールページに反映されます。"
            : "評価を送信するには、ログインが必要です。"}
        </p>
      </div>
    </div>
  );
}
