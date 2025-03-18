import type { UserRepository } from "../domain/repositories/user-repository.js";
import type { ProfileRepository } from "../domain/repositories/profile-repository.js";
import type { User, UserWithProfile } from "../domain/models/user.js";
import type { BaristaProfileDTO } from "../domain/models/profile.js";

/**
 * ユーザーサービスクラス
 * ユーザー関連のビジネスロジックを実装
 */
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private profileRepository: ProfileRepository,
  ) {}

  /**
   * ユーザー情報取得
   * @param userId ユーザーID
   */
  async getUserById(userId: string): Promise<User | null> {
    return this.userRepository.findById(userId);
  }

  /**
   * プロフィール付きユーザー情報取得
   * @param userId ユーザーID
   */
  async getUserWithProfile(userId: string): Promise<UserWithProfile | null> {
    const user = await this.userRepository.findById(userId);
    if (!user) return null;

    const profile = await this.profileRepository.findByUserId(userId);

    return {
      ...user,
      profile: profile || undefined,
    };
  }

  /**
   * バリスタプロフィール作成
   * @param userId ユーザーID
   * @param profileData プロフィールデータ
   */
  async createBaristaProfile(
    userId: string,
    profileData: BaristaProfileDTO,
  ): Promise<UserWithProfile> {
    // ユーザー存在確認
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // プロフィールが既に存在するか確認
    const existingProfile = await this.profileRepository.findByUserId(userId);
    if (existingProfile) {
      throw new Error("Profile already exists");
    }

    // プロフィール作成
    const profile = await this.profileRepository.create(userId, profileData);

    return {
      ...user,
      profile,
    };
  }

  /**
   * バリスタプロフィール更新
   * @param userId ユーザーID
   * @param profileId プロフィールID
   * @param profileData プロフィール更新データ
   */
  async updateBaristaProfile(
    userId: string,
    profileId: string,
    profileData: Partial<BaristaProfileDTO>,
  ): Promise<UserWithProfile> {
    // ユーザー存在確認
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // プロフィール存在確認と所有権確認
    const existingProfile = await this.profileRepository.findById(profileId);
    if (!existingProfile) {
      throw new Error("Profile not found");
    }

    if (existingProfile.userId !== userId) {
      throw new Error("Unauthorized");
    }

    // プロフィール更新
    const updatedProfile = await this.profileRepository.update(profileId, profileData);

    return {
      ...user,
      profile: updatedProfile,
    };
  }
}
