import type { Barista } from "../../../domain/entities/barista";
import type { BaristaRepository } from "../../../domain/repositories/barista-repository";

/**
 * バリスタ詳細取得ユースケース
 *
 * 指定されたIDのバリスタ情報を取得する
 */
export class GetBaristaByIdUseCase {
  /**
   * コンストラクタ
   *
   * @param baristaRepository - バリスタリポジトリのインスタンス
   */
  constructor(private readonly baristaRepository: BaristaRepository) {}

  /**
   * 指定IDのバリスタを取得する
   *
   * @param id - 取得するバリスタのID
   * @returns バリスタエンティティ、存在しない場合はnull
   * @throws バリスタ取得時にエラーが発生した場合
   */
  async execute(id: string): Promise<Barista | null> {
    if (!id) {
      throw new Error("バリスタIDが指定されていません");
    }

    try {
      return await this.baristaRepository.getBaristaById(id);
    } catch (error) {
      console.error(`ID: ${id} のバリスタ取得エラー:`, error);
      throw new Error("バリスタの取得に失敗しました");
    }
  }
}
