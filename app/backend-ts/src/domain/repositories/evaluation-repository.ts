import type {
  Evaluation,
  EvaluationCategory,
  EvaluationItem,
  EvaluateBaristaDTO,
} from "../models/evaluation.js";

/**
 * 評価リポジトリインターフェース
 * 評価エンティティに対するデータアクセス操作を定義
 */
export interface EvaluationRepository {
  /**
   * IDによる評価検索
   */
  findById(id: string): Promise<Evaluation | null>;

  /**
   * バリスタIDによる評価一覧取得
   */
  findByBaristaId(baristaId: string): Promise<Evaluation[]>;

  /**
   * 評価登録
   */
  create(evaluatorUserId: string | null, evaluateDTO: EvaluateBaristaDTO): Promise<Evaluation>;

  /**
   * 評価カテゴリと評価項目一覧取得
   */
  getCategories(): Promise<EvaluationCategory[]>;

  /**
   * 共通評価項目一覧取得
   */
  getCommonItems(): Promise<EvaluationItem[]>;
}
