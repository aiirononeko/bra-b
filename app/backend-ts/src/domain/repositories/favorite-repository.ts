import type { Favorite, AddFavoriteDTO } from "../models/favorite.js";

/**
 * お気に入りリポジトリインターフェース
 * お気に入りエンティティに対するデータアクセス操作を定義
 */
export interface FavoriteRepository {
  /**
   * ユーザーIDによるお気に入り一覧取得
   */
  findByUserId(userId: string): Promise<Favorite[]>;

  /**
   * ユーザーIDとバリスタIDによるお気に入り検索
   */
  findByUserIdAndBaristaId(userId: string, baristaId: string): Promise<Favorite | null>;

  /**
   * お気に入り追加
   */
  create(userId: string, favoriteDTO: AddFavoriteDTO): Promise<Favorite>;

  /**
   * お気に入り削除
   */
  delete(userId: string, baristaId: string): Promise<void>;
}
