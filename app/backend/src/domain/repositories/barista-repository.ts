import type { Barista, BaristaListItem } from "../entities/barista";

/**
 * バリスタリポジトリインターフェース
 *
 * バリスタエンティティの永続化と取得の責務を定義
 */
export interface BaristaRepository {
  /**
   * すべてのバリスタを取得する
   *
   * @returns バリスタ一覧の配列
   */
  getAllBaristas(): Promise<BaristaListItem[]>;

  /**
   * 指定されたIDのバリスタを取得する
   *
   * @param id - 取得するバリスタのID
   * @returns バリスタエンティティ、存在しない場合はnull
   */
  getBaristaById(id: string): Promise<Barista | null>;

  /**
   * 新しいバリスタを作成する
   *
   * @param barista - 作成するバリスタのデータ
   * @returns 作成されたバリスタエンティティ
   */
  createBarista(barista: Omit<Barista, "id" | "createdAt" | "evaluationCount">): Promise<Barista>;

  /**
   * 既存のバリスタを更新する
   *
   * @param id - 更新するバリスタのID
   * @param barista - 更新するデータ（部分的な更新が可能）
   * @returns 更新されたバリスタエンティティ
   */
  updateBaristaById(id: string, barista: Partial<Barista>): Promise<Barista>;

  /**
   * バリスタを削除する
   *
   * @param id - 削除するバリスタのID
   * @returns 削除が成功したかどうか
   */
  deleteBaristaById(id: string): Promise<boolean>;
}
