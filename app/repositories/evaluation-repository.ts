import { createClient } from "@/utils/supabase/server";

// 評価項目の型定義
export type EvaluationItem = {
  id: string;
  name: string;
  is_active: boolean;
  sort_order: number;
};

// 評価データの型定義
export type EvaluationData = {
  barista_profile_id: string;
  evaluator_id: string;
  evaluation_items: string[];
};

/**
 * 有効な評価項目をすべて取得する
 */
export async function fetchEvaluationItems() {
  const supabase = await createClient();

  return supabase
    .from("evaluation_items")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
}

/**
 * バリスタの評価を登録する
 */
export async function createEvaluation(evaluationData: EvaluationData) {
  const supabase = await createClient();

  // 評価レコードを作成
  const { data: evaluation, error: evaluationError } = await supabase
    .from("evaluations")
    .insert({
      barista_profile_id: evaluationData.barista_profile_id,
      evaluator_id: evaluationData.evaluator_id,
      evaluated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (evaluationError || !evaluation) {
    return { error: evaluationError };
  }

  // 評価項目の詳細を作成
  const evaluationDetailsData = evaluationData.evaluation_items.map((itemId) => ({
    evaluation_id: evaluation.id,
    evaluation_item_id: itemId,
  }));

  const { error: detailsError } = await supabase
    .from("evaluation_details")
    .insert(evaluationDetailsData);

  return { data: evaluation, error: detailsError };
}

/**
 * バリスタの評価を取得する
 */
export async function fetchBaristaEvaluations(baristaProfileId: string) {
  const supabase = await createClient();

  return supabase
    .from("evaluations")
    .select(
      `
      id,
      evaluated_at,
      evaluation_details(
        evaluation_item_id,
        evaluation_items(
          id,
          name
        )
      )
    `
    )
    .eq("barista_profile_id", baristaProfileId)
    .order("evaluated_at", { ascending: false });
}
