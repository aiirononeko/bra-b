import type { Profile, BaristaProfileDTO } from "../models/profile.js";

/**
 * プロフィールリポジトリインターフェース
 * プロフィールエンティティに対するデータアクセス操作を定義
 */
export interface ProfileRepository {
  /**
   * IDによるプロフィール検索
   */
  findById(id: string): Promise<Profile | null>;

  /**
   * ユーザーIDによるプロフィール検索
   */
  findByUserId(userId: string): Promise<Profile | null>;

  /**
   * プロフィール作成
   */
  create(userId: string, profile: BaristaProfileDTO): Promise<Profile>;

  /**
   * プロフィール更新
   */
  update(id: string, profile: Partial<BaristaProfileDTO>): Promise<Profile>;
}
