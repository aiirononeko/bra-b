"use server";

import { type EvaluationFormData, evaluationSchema } from "@/app/lib/schemas/evaluation-schemas";
import {
  createEvaluation as createEvaluationRepo,
  updateBaristaCategory,
} from "@/app/repositories/evaluation-repository";
import { revalidatePath } from "next/cache";

/**
 * バリスタの評価を作成するサーバーアクション
 */
export async function createEvaluation(data: EvaluationFormData) {
  try {
    // デバッグ情報
    console.log("評価送信データ:", JSON.stringify(data, null, 2));

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

    // デバッグ情報
    console.log("バリデーション済みデータ:", JSON.stringify(validatedData, null, 2));

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
      return { error: `評価の保存中にエラーが発生しました: ${JSON.stringify(result.error)}` };
    }

    // バリスタカテゴリを更新（エッジファンクション経由）
    try {
      await updateBaristaCategory(validatedData.baristaId, "INSERT");
    } catch (error) {
      console.error("バリスタカテゴリ更新中にエラーが発生しました:", error);
      // カテゴリ更新に失敗しても評価自体は成功としてユーザーに返す
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

/**
 * バリスタカテゴリを手動で更新するサーバーアクション
 */
export async function recalculateBaristaCategoryAction(baristaId: string) {
  try {
    // Edge Functionを使用してカテゴリを更新
    const { data, error } = await updateBaristaCategory(baristaId);

    if (error) {
      console.error("バリスタカテゴリ更新中にエラーが発生しました:", error);
      return { error: "バリスタカテゴリ更新中にエラーが発生しました" };
    }

    // バリスタのプロフィールページを再検証
    revalidatePath(`/barista/${baristaId}`);

    return { success: true, category: data?.category };
  } catch (error) {
    console.error("バリスタカテゴリ更新中に予期せぬエラーが発生しました:", error);
    return { error: "バリスタカテゴリ更新中に予期せぬエラーが発生しました" };
  }
}
