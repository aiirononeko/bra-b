import type { PrismaClient } from "@prisma/client/edge";

import type { Barista, BaristaListItem } from "../../domain/entities/barista";
import {
  baristaSchema,
  createBaristaSchema,
  updateBaristaSchema,
} from "../../domain/entities/barista";
import type { BaristaRepository } from "../../domain/repositories/barista-repository";
import { BaristaId, UserId } from "../../domain/value-objects/id";

/**
 * Prisma実装のバリスタリポジトリ
 */
export class PrismaBaristaRepository implements BaristaRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<BaristaListItem[]> {
    // バリスタ（プロフィールタイプが'barista'）の一覧を取得
    const results = await this.prisma.profile.findMany({
      where: {
        type: "barista",
      },
      select: {
        id: true,
        displayName: true,
        iconUrl: true,
        shopName: true,
      },
    });

    return results.map((result) => ({
      id: result.id,
      displayName: result.displayName,
      iconUrl: result.iconUrl ?? undefined,
      shopName: result.shopName ?? undefined,
    }));
  }

  async findById(id: string): Promise<Barista | null> {
    // IDの検証
    try {
      const baristaId = BaristaId.parse(id);

      const profile = await this.prisma.profile.findFirst({
        where: {
          id: baristaId.toString(),
          type: "barista",
        },
      });

      if (!profile) {
        return null;
      }

      // 評価件数取得
      const evaluationCount = await this.prisma.evaluation.count({
        where: {
          baristaProfileId: baristaId.toString(),
        },
      });

      const baristaData = {
        id: profile.id,
        userId: profile.userId,
        displayName: profile.displayName,
        iconUrl: profile.iconUrl ?? undefined,
        bio: profile.bio ?? undefined,
        snsLinks: profile.snsLinks ? JSON.parse(profile.snsLinks) : undefined,
        shopName: profile.shopName ?? undefined,
        createdAt: profile.createdAt,
        evaluationCount,
      };

      // バリデーション実行
      const parseResult = baristaSchema.safeParse(baristaData);
      if (!parseResult.success) {
        console.error("バリスタエンティティのバリデーションエラー:", parseResult.error);
        return null;
      }

      return baristaData;
    } catch (error) {
      console.error("無効なバリスタID:", error);
      return null;
    }
  }

  async create(barista: Omit<Barista, "id" | "createdAt" | "evaluationCount">): Promise<Barista> {
    // バリデーション実行
    const parseResult = createBaristaSchema.safeParse(barista);
    if (!parseResult.success) {
      throw new Error(`バリスタ作成データのバリデーションエラー: ${parseResult.error.message}`);
    }

    try {
      // ユーザーIDの検証
      const userId = UserId.parse(barista.userId);

      // 新しいバリスタIDを生成
      const baristaId = BaristaId.generate();
      const snsLinksJson = barista.snsLinks ? JSON.stringify(barista.snsLinks) : null;

      await this.prisma.profile.create({
        data: {
          id: baristaId.toString(),
          userId: userId.toString(),
          type: "barista",
          displayName: barista.displayName,
          iconUrl: barista.iconUrl ?? null,
          bio: barista.bio ?? null,
          snsLinks: snsLinksJson,
          shopName: barista.shopName ?? null,
        },
      });

      const createdBarista = await this.findById(baristaId.toString());
      if (!createdBarista) {
        throw new Error("バリスタの作成に失敗しました");
      }

      return createdBarista;
    } catch (error) {
      throw new Error(
        `無効なユーザーID: ${error instanceof Error ? error.message : "不明なエラー"}`,
      );
    }
  }

  async update(id: string, barista: Partial<Barista>): Promise<Barista> {
    // バリデーション実行
    const parseResult = updateBaristaSchema.safeParse(barista);
    if (!parseResult.success) {
      throw new Error(`バリスタ更新データのバリデーションエラー: ${parseResult.error.message}`);
    }

    try {
      // IDの検証
      const baristaId = BaristaId.parse(id);

      const snsLinksJson = barista.snsLinks ? JSON.stringify(barista.snsLinks) : undefined;

      await this.prisma.profile.update({
        where: {
          id: baristaId.toString(),
          type: "barista",
        },
        data: {
          displayName: barista.displayName,
          iconUrl: barista.iconUrl,
          bio: barista.bio,
          snsLinks: snsLinksJson,
          shopName: barista.shopName,
        },
      });

      const updatedBarista = await this.findById(baristaId.toString());
      if (!updatedBarista) {
        throw new Error("バリスタの更新に失敗しました");
      }

      return updatedBarista;
    } catch (error) {
      throw new Error(
        `無効なバリスタID: ${error instanceof Error ? error.message : "不明なエラー"}`,
      );
    }
  }
}
