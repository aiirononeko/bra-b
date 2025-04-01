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

// 管理者ダッシュボード用の評価履歴データ型
export type AdminEvaluationHistory = {
  id: string;
  evaluated_at: string;
  barista_profile: {
    id: string;
    display_name: string;
    shop_name: string | null;
    barista_categories: {
      category: string;
      confidence_score: number;
      friendly_score: number;
      delicious_score: number;
      sophisticated_score: number;
      entertainer_score: number;
      calculated_at: string;
    } | null;
  };
  evaluator: {
    id: string;
    display_name: string;
  };
  evaluation_details: {
    evaluation_items: {
      name: string;
    };
  }[];
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

  if (detailsError) {
    return { data: evaluation, error: detailsError };
  }

  // Edge Functionを呼び出してバリスタカテゴリを更新
  try {
    await updateBaristaCategory(evaluationData.barista_profile_id, "INSERT");
  } catch (error) {
    console.error("バリスタカテゴリ更新エラー:", error);
    // カテゴリ更新に失敗しても評価登録自体は成功させる
  }

  return { data: evaluation, error: null };
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

/**
 * Edge Functionを使ってバリスタカテゴリを更新する
 */
export async function updateBaristaCategory(
  baristaId: string,
  eventType: "INSERT" | "UPDATE" | "DELETE" = "UPDATE"
) {
  const supabase = await createClient();

  return supabase.functions.invoke("update-barista-category", {
    method: "POST",
    body: {
      barista_id: baristaId,
      event_type: eventType,
    },
  });
}

/**
 * 管理者ダッシュボード用にすべての評価履歴を取得する
 */
export async function fetchAllEvaluationsForAdmin() {
  const supabase = await createClient();

  return supabase
    .from("evaluations")
    .select(
      `
      id,
      evaluated_at,
      barista_profile:barista_profile_id(
        id,
        display_name,
        shop_name,
        barista_categories(
          category,
          confidence_score,
          friendly_score,
          delicious_score,
          sophisticated_score,
          entertainer_score,
          calculated_at
        )
      ),
      evaluator:evaluator_id(
        id,
        display_name
      ),
      evaluation_details(
        evaluation_items(
          name
        )
      )
    `
    )
    .order("evaluated_at", { ascending: false });
}
