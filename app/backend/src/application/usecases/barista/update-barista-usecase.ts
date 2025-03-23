import type { Barista } from "../../../domain/entities/barista";
import type { BaristaRepository } from "../../../domain/repositories/barista-repository";

/**
 * バリスタ更新ユースケース
 *
 * 既存のバリスタプロフィール情報を更新する
 */
export class UpdateBaristaUseCase {
  /**
   * コンストラクタ
   *
   * @param baristaRepository - バリスタリポジトリのインスタンス
   */
  constructor(private readonly baristaRepository: BaristaRepository) {}

  /**
   * 指定IDのバリスタ情報を更新する
   *
   * @param id - 更新するバリスタのID
   * @param data - 更新するデータ（部分的な更新が可能）
   * @returns 更新されたバリスタエンティティ
   * @throws バリデーションエラーや更新失敗時にエラーをスロー
   */
  async execute(id: string, data: Partial<Barista>): Promise<Barista> {
    // IDチェック
    if (!id) {
      throw new Error("バリスタIDが指定されていません");
    }

    // データの存在チェック
    if (!data || Object.keys(data).length === 0) {
      throw new Error("更新するデータが指定されていません");
    }

    try {
      // 更新対象のバリスタを取得して存在確認
      const barista = await this.baristaRepository.getBaristaById(id);
      if (!barista) {
        throw new Error("指定されたIDのバリスタが見つかりません");
      }

      // TODO: 認証情報からユーザー自身のプロフィールかどうかを確認する
      // const currentUserId = ...
      // if (barista.userId !== currentUserId) {
      //   throw new Error("このバリスタプロフィールを更新する権限がありません");
      // }

      // バリスタの更新
      return await this.baristaRepository.updateBaristaById(id, data);
    } catch (error) {
      console.error(`ID: ${id} のバリスタ更新エラー:`, error);
      if (error instanceof Error) {
        throw new Error(`バリスタの更新に失敗しました: ${error.message}`);
      }
      throw new Error("バリスタの更新に失敗しました");
    }
  }
}
