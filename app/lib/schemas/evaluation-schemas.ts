import { z } from "zod";

/**
 * 評価送信用のバリデーションスキーマ
 */
export const evaluationSchema = z.object({
  baristaId: z.string().uuid({
    message: "有効なバリスタIDを指定してください",
  }),
  userId: z.string().uuid({
    message: "有効なユーザーIDを指定してください",
  }),
  selectedItems: z.array(z.string().uuid()).min(1, {
    message: "少なくとも1つの評価項目を選択してください",
  }),
});

/**
 * 評価送信データの型定義
 */
export type EvaluationFormData = z.infer<typeof evaluationSchema>;
