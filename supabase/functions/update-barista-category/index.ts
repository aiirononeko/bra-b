import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// SupabaseClientの型定義
type SupabaseClient = ReturnType<typeof createClient>;

// カテゴリ定義
type CategoryType = "friendly" | "delicious" | "sophisticated" | "entertainer";

// カテゴリに対応するアイテムのマッピング
const categoryItemsMapping: Record<CategoryType, string[]> = {
  friendly: [
    // フレンドリーカテゴリに対応する評価項目ID
    "笑顔が素敵",
    "話しやすい",
    "親身になってくれる",
    "常連を覚えている",
    "明るい",
  ],
  delicious: [
    // 美味しい一杯カテゴリに対応する評価項目ID
    "コーヒーの知識が豊富",
    "味が素晴らしい",
    "豆の説明が的確",
    "淹れ方が丁寧",
    "ラテアートが美しい",
  ],
  sophisticated: [
    // 洗練された接客カテゴリに対応する評価項目ID
    "身だしなみが清潔",
    "丁寧な接客",
    "店内の清潔さ",
    "テキパキした動き",
    "声が聞き取りやすい",
  ],
  entertainer: [
    // エンターテイナーカテゴリに対応する評価項目ID
    "話が面白い",
    "個性的",
    "コーヒーへの熱意がある",
    "記憶に残る体験",
    "SNSが魅力的",
  ],
};

// リクエストの型定義
interface UpdateBaristaRequest {
  barista_id: string;
  event_type: "INSERT" | "UPDATE" | "DELETE";
}

// レスポンスの型定義
interface UpdateBaristaResponse {
  success: boolean;
  category?: string;
  error?: string;
}

// カテゴリスコア計算結果
interface CategoryScores {
  categoryName: CategoryType;
  count: number;
  score: number;
}

// 評価データの型定義
interface Evaluation {
  id: string;
  evaluation_details: EvaluationDetail[];
}

interface EvaluationDetail {
  evaluation_items: {
    id: string;
    name: string;
  };
}

serve(async (req: Request) => {
  try {
    // リクエストヘッダーからSupabaseクライアントを作成
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization") || "" },
        },
      }
    );

    // POSTリクエストのみを受け付ける
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ success: false, error: "POSTリクエストのみ受け付けています" }),
        { status: 405, headers: { "Content-Type": "application/json" } }
      );
    }

    // リクエストボディを取得
    const requestData: UpdateBaristaRequest = await req.json();
    const { barista_id } = requestData;

    if (!barista_id) {
      return new Response(JSON.stringify({ success: false, error: "barista_id は必須です" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      // バリスタカテゴリを計算して更新
      const category = await calculateAndUpdateBaristaCategory(supabaseClient, barista_id);

      // 成功レスポンスを返す
      const response: UpdateBaristaResponse = {
        success: true,
        category,
      };

      return new Response(JSON.stringify(response), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("カテゴリ計算エラー:", error);
      return new Response(JSON.stringify({ success: false, error: "カテゴリ計算に失敗しました" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    // エラー処理
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ success: false, error: "予期せぬエラーが発生しました" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

/**
 * バリスタの評価データを基にカテゴリを計算し、結果をデータベースに保存する
 */
async function calculateAndUpdateBaristaCategory(
  supabase: SupabaseClient,
  baristaId: string
): Promise<string> {
  // バリスタの評価データを取得
  const { data: evaluations, error: evaluationsError } = await supabase
    .from("evaluations")
    .select(`
      id,
      evaluation_details(
        evaluation_item_id,
        evaluation_items(
          id,
          name
        )
      )
    `)
    .eq("barista_profile_id", baristaId);

  if (evaluationsError) {
    console.error("評価データ取得エラー:", evaluationsError);
    throw new Error("評価データの取得に失敗しました");
  }

  // 評価データがない場合
  if (!evaluations || evaluations.length === 0) {
    // まだカテゴリを判定できないので、既存のカテゴリ情報を削除
    await supabase.from("barista_categories").delete().eq("barista_profile_id", baristaId);

    return "未評価";
  }

  // 評価アイテムの出現回数をカウント
  const itemCounts: Record<string, number> = {};
  // すべての評価アイテム名を取得（カテゴリ分類用）
  const evaluationItemNames: string[] = [];

  // 各評価から評価項目を収集
  for (const evaluation of evaluations) {
    if (evaluation.evaluation_details && evaluation.evaluation_details.length > 0) {
      for (const detail of evaluation.evaluation_details) {
        if (detail.evaluation_items) {
          const itemName = detail.evaluation_items.name;
          if (itemName) {
            // アイテム出現回数をカウント
            itemCounts[itemName] = (itemCounts[itemName] || 0) + 1;
            // ユニークなアイテム名を収集
            if (!evaluationItemNames.includes(itemName)) {
              evaluationItemNames.push(itemName);
            }
          }
        }
      }
    }
  }

  // カテゴリごとのスコアを計算
  const categoryScores: CategoryScores[] = [];
  const totalEvaluations = evaluations.length;

  // 各カテゴリのスコアを計算
  for (const category of Object.keys(categoryItemsMapping) as CategoryType[]) {
    const categoryItems = categoryItemsMapping[category];
    let categoryCount = 0;

    // このカテゴリに関連する評価項目の出現回数を計算
    for (const itemName of evaluationItemNames) {
      if (categoryItems.includes(itemName)) {
        categoryCount += itemCounts[itemName] || 0;
      }
    }

    // カテゴリスコアを計算 (評価数に基づく正規化スコア)
    const score = totalEvaluations > 0 ? categoryCount / (totalEvaluations * 2) : 0;

    categoryScores.push({
      categoryName: category,
      count: categoryCount,
      score: Math.min(score, 5), // 最大スコアは5とする
    });
  }

  // スコアに基づいてソート（降順）
  categoryScores.sort((a, b) => b.score - a.score);

  // 最も高いスコアのカテゴリを決定
  const topCategory = categoryScores[0];
  const confidenceScore =
    topCategory.score > 0
      ? Math.min(topCategory.score / Math.max(...categoryScores.map((c) => c.score)), 1)
      : 0;

  // カテゴリデータを準備
  const now = new Date().toISOString();

  // 現在のカテゴリデータを削除
  await supabase.from("barista_categories").delete().eq("barista_profile_id", baristaId);

  // 新しいカテゴリデータを挿入
  const { error: insertError } = await supabase.from("barista_categories").insert({
    barista_profile_id: baristaId,
    category: topCategory.categoryName,
    confidence_score: confidenceScore,
    friendly_score: categoryScores.find((c) => c.categoryName === "friendly")?.score || 0,
    delicious_score: categoryScores.find((c) => c.categoryName === "delicious")?.score || 0,
    sophisticated_score: categoryScores.find((c) => c.categoryName === "sophisticated")?.score || 0,
    entertainer_score: categoryScores.find((c) => c.categoryName === "entertainer")?.score || 0,
    calculated_at: now,
    created_at: now,
    updated_at: now,
  });

  if (insertError) {
    console.error("カテゴリデータ挿入エラー:", insertError);
    throw new Error("カテゴリデータの保存に失敗しました");
  }

  return topCategory.categoryName;
}
