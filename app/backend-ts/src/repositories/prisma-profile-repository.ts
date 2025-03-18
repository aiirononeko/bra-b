import type { PrismaClient } from "@prisma/client";
import type { Profile, BaristaProfileDTO } from "../domain/models/profile.js";
import type { ProfileRepository } from "../domain/repositories/profile-repository.js";

/**
 * Prismaを使用したプロフィールリポジトリの実装
 */
export class PrismaProfileRepository implements ProfileRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * IDによるプロフィール検索
   */
  async findById(id: string): Promise<Profile | null> {
    return this.prisma.profile.findUnique({
      where: { id },
    });
  }

  /**
   * ユーザーIDによるプロフィール検索
   */
  async findByUserId(userId: string): Promise<Profile | null> {
    return this.prisma.profile.findUnique({
      where: { userId },
    });
  }

  /**
   * プロフィール作成
   */
  async create(userId: string, profileData: BaristaProfileDTO): Promise<Profile> {
    // snsLinksの配列をJSON文字列に変換
    const snsLinks = profileData.snsLinks ? JSON.stringify(profileData.snsLinks) : undefined;

    return this.prisma.profile.create({
      data: {
        userId,
        type: "barista", // バリスタタイプとして作成
        displayName: profileData.displayName,
        iconURL: profileData.iconUrl,
        bio: profileData.bio,
        snsLinks,
        shopName: profileData.shopName,
      },
    });
  }

  /**
   * プロフィール更新
   */
  async update(id: string, profileData: Partial<BaristaProfileDTO>): Promise<Profile> {
    // snsLinksの配列をJSON文字列に変換
    const snsLinks = profileData.snsLinks ? JSON.stringify(profileData.snsLinks) : undefined;

    const updateData: any = {
      ...profileData,
      snsLinks,
    };

    // iconUrlはDBではiconURLとして保存
    if (profileData.iconUrl !== undefined) {
      updateData.iconURL = profileData.iconUrl;
      delete updateData.iconUrl;
    }

    return this.prisma.profile.update({
      where: { id },
      data: updateData,
    });
  }
}
