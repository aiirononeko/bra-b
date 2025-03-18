import type { Tip, SendTipDTO } from "../models/tip.js";

/**
 * チップリポジトリインターフェース
 * チップエンティティに対するデータアクセス操作を定義
 */
export interface TipRepository {
  /**
   * IDによるチップ検索
   */
  findById(id: string): Promise<Tip | null>;

  /**
   * バリスタIDによるチップ一覧取得
   */
  findByBaristaId(baristaId: string): Promise<Tip[]>;

  /**
   * 送信者IDによるチップ一覧取得
   */
  findBySenderId(senderId: string): Promise<Tip[]>;

  /**
   * チップ登録
   */
  create(senderId: string | null, tipDTO: SendTipDTO, paymentIntentId: string): Promise<Tip>;
}
