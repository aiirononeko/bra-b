import type { UserRepository } from "../domain/repositories/user-repository.js";
import jwt from "jsonwebtoken";

/**
 * 認証サービスクラス
 * ユーザー認証に関するビジネスロジックを実装
 */
export class AuthService {
  constructor(private userRepository: UserRepository) {}

  /**
   * メールリンク認証の処理
   * @param email メールアドレス
   */
  async registerWithEmail(email: string): Promise<void> {
    const existingUser = await this.userRepository.findByEmail(email);

    if (!existingUser) {
      await this.userRepository.create({
        email,
        authType: "magic-link",
      });
    }

    // TODO: 実際のメール送信ロジックを実装
    // 開発段階では実装を省略
  }

  /**
   * Google認証の処理
   * @param token Googleから取得したトークン
   */
  async authenticateWithGoogle(token: string): Promise<string> {
    // TODO: 実際のGoogleトークン検証ロジックを実装
    // 開発段階ではダミーデータを使用
    const email = "dummy@example.com"; // 実際はGoogleトークンから取得

    let user = await this.userRepository.findByEmail(email);

    if (!user) {
      user = await this.userRepository.create({
        email,
        authType: "google",
      });
    }

    return this.generateJwtToken(user.id);
  }

  /**
   * JWTトークン生成
   * @param userId ユーザーID
   */
  private generateJwtToken(userId: string): string {
    return jwt.sign({ sub: userId }, process.env.JWT_SECRET || "fallback-secret", {
      expiresIn: "7d",
    });
  }
}
