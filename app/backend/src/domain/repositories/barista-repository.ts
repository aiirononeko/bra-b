import type { Barista, BaristaListItem } from "../entities/barista";

/**
 * バリスタリポジトリインターフェース
 */
export interface BaristaRepository {
  /**
   * 全バリスタのリストを取得
   */
  findAll(): Promise<BaristaListItem[]>;

  /**
   * IDでバリスタを取得
   */
  findById(id: string): Promise<Barista | null>;

  /**
   * 新しいバリスタを作成
   */
  create(barista: Omit<Barista, "id" | "createdAt" | "evaluationCount">): Promise<Barista>;

  /**
   * バリスタ情報を更新
   */
  update(id: string, barista: Partial<Barista>): Promise<Barista>;
}
