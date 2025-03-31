"use server";

import { type EvaluationFormData, evaluationSchema } from "@/app/lib/schemas/evaluation-schemas";
import { createEvaluation as createEvaluationRepo } from "@/app/repositories/evaluation-repository";
import { revalidatePath } from "next/cache";

/**
 * バリスタの評価を作成するサーバーアクション
 */
export async function createEvaluation(data: EvaluationFormData) {
  try {
    // zodスキーマを使ったバリデーション
    const validationResult = evaluationSchema.safeParse(data);

    // バリデーションエラーがある場合
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors.map((err) => err.message).join(", ");
      console.error("バリデーションエラー:", errorMessage);
      return { error: errorMessage };
    }

    // バリデーション済みのデータを取得
    const validatedData = validationResult.data;

    // 評価データを作成
    const evaluationData = {
      barista_profile_id: validatedData.baristaId,
      evaluator_id: validatedData.userId,
      evaluation_items: validatedData.selectedItems,
    };

    // データベースに評価を保存
    const result = await createEvaluationRepo(evaluationData);

    // エラーがある場合はエラーを返却
    if (result.error) {
      console.error("評価の保存中にエラーが発生しました:", result.error);
      return { error: "評価の保存中にエラーが発生しました" };
    }

    // 成功した場合は、バリスタのプロフィールページとマイページを再検証
    revalidatePath(`/barista/${validatedData.baristaId}`);
    revalidatePath("/account");

    return { success: true };
  } catch (error) {
    console.error("評価作成中にエラーが発生しました:", error);
    return { error: "評価作成中にエラーが発生しました" };
  }
}
