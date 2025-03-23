import type { Barista } from "../../../domain/entities/barista";
import type { BaristaRepository } from "../../../domain/repositories/barista-repository";

/**
 * バリスタ作成ユースケース
 *
 * 新しいバリスタプロフィールをシステムに登録する
 */
export class CreateBaristaUseCase {
  /**
   * コンストラクタ
   *
   * @param baristaRepository - バリスタリポジトリのインスタンス
   */
  constructor(private readonly baristaRepository: BaristaRepository) {}

  /**
   * 新しいバリスタを作成する
   *
   * @param data - バリスタ作成に必要なデータ
   * @returns 作成されたバリスタエンティティ
   * @throws バリデーションエラーや作成失敗時にエラーをスロー
   */
  async execute(data: Omit<Barista, "id" | "createdAt" | "evaluationCount">): Promise<Barista> {
    // データの存在チェック
    if (!data) {
      throw new Error("バリスタ作成データが指定されていません");
    }

    // 必須項目のチェック
    if (!data.userId || !data.displayName) {
      throw new Error("ユーザーIDと表示名は必須です");
    }

    try {
      // ユースケース層での追加のビジネスロジックがある場合はここに実装

      // バリスタの作成
      return await this.baristaRepository.createBarista(data);
    } catch (error) {
      console.error("バリスタ作成エラー:", error);
      if (error instanceof Error) {
        throw new Error(`バリスタの作成に失敗しました: ${error.message}`);
      }
      throw new Error("バリスタの作成に失敗しました");
    }
  }
}
