import type { EvaluationRepository } from "../domain/repositories/evaluation-repository.js";
import type { ProfileRepository } from "../domain/repositories/profile-repository.js";
import type {
  Evaluation,
  EvaluationCategory,
  EvaluationItem,
  EvaluateBaristaDTO,
} from "../domain/models/evaluation.js";

/**
 * 評価サービスクラス
 * 評価関連のビジネスロジックを実装
 */
export class EvaluationService {
  constructor(
    private evaluationRepository: EvaluationRepository,
    private profileRepository: ProfileRepository,
  ) {}

  /**
   * 評価カテゴリと評価項目の一覧取得
   */
  async getEvaluationCategories(): Promise<{
    categories: EvaluationCategory[];
    commonTags: EvaluationItem[];
  }> {
    const categories = await this.evaluationRepository.getCategories();
    const commonTags = await this.evaluationRepository.getCommonItems();

    return {
      categories,
      commonTags,
    };
  }

  /**
   * バリスタ評価の登録
   * @param evaluatorUserId 評価者ID (匿名の場合はnull)
   * @param evaluateDTO 評価データ
   */
  async evaluateBarista(
    evaluatorUserId: string | null,
    evaluateDTO: EvaluateBaristaDTO,
  ): Promise<Evaluation> {
    // バリスタプロフィールの存在確認
    const baristaProfile = await this.profileRepository.findById(evaluateDTO.baristaId);
    if (!baristaProfile) {
      throw new Error("Barista profile not found");
    }

    // バリスタ評価の登録
    return this.evaluationRepository.create(evaluatorUserId, evaluateDTO);
  }

  /**
   * バリスタの評価一覧取得
   * @param baristaId バリスタプロフィールID
   */
  async getBaristaEvaluations(baristaId: string): Promise<Evaluation[]> {
    // バリスタプロフィールの存在確認
    const baristaProfile = await this.profileRepository.findById(baristaId);
    if (!baristaProfile) {
      throw new Error("Barista profile not found");
    }

    // 評価一覧取得
    return this.evaluationRepository.findByBaristaId(baristaId);
  }
}
