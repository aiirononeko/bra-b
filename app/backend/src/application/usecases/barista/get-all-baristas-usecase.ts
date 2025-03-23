import type { BaristaListItem } from "../../../domain/entities/barista";
import type { BaristaRepository } from "../../../domain/repositories/barista-repository";

/**
 * バリスタ一覧取得ユースケース
 *
 * システムに登録されているすべてのバリスタの一覧を取得する
 */
export class GetAllBaristasUseCase {
  /**
   * コンストラクタ
   *
   * @param baristaRepository - バリスタリポジトリのインスタンス
   */
  constructor(private readonly baristaRepository: BaristaRepository) {}

  /**
   * バリスタの一覧を取得する
   *
   * @returns バリスタの一覧情報
   */
  async execute(): Promise<BaristaListItem[]> {
    try {
      return await this.baristaRepository.getAllBaristas();
    } catch (error) {
      console.error("バリスタ一覧取得エラー:", error);
      throw new Error("バリスタ一覧の取得に失敗しました");
    }
  }
}
