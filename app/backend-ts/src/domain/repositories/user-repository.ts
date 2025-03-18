import type { User, CreateUserDTO } from "../models/user.js";

/**
 * ユーザーリポジトリインターフェース
 * ユーザーエンティティに対するデータアクセス操作を定義
 */
export interface UserRepository {
  /**
   * IDによるユーザー検索
   */
  findById(id: string): Promise<User | null>;

  /**
   * メールアドレスによるユーザー検索
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * ユーザー作成
   */
  create(user: CreateUserDTO): Promise<User>;

  /**
   * ユーザー更新
   */
  update(id: string, user: Partial<User>): Promise<User>;

  /**
   * ユーザー論理削除
   */
  delete(id: string): Promise<void>;
}
