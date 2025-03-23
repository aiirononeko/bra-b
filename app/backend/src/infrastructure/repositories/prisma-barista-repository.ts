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
 * Prisma実装のバリスタリポジトリクラス
 *
 * バリスタエンティティの永続化と取得を担当するリポジトリの実装
 * Prismaを使用してデータベースとのインタラクションを行う
 */
export class PrismaBaristaRepository implements BaristaRepository {
  /**
   * コンストラクタ
   *
   * @param prisma - Prismaクライアントのインスタンス
   */
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * すべてのバリスタを取得する
   *
   * @returns バリスタ一覧の配列
   */
  async getAllBaristas(): Promise<BaristaListItem[]> {
    try {
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
        orderBy: {
          createdAt: "desc",
        },
      });

      // 取得結果をドメインモデルに変換
      return results.map((result) => ({
        id: result.id,
        displayName: result.displayName,
        iconUrl: result.iconUrl ?? undefined,
        shopName: result.shopName ?? undefined,
      }));
    } catch (error) {
      console.error("バリスタ一覧取得エラー:", error);
      throw new Error("バリスタ一覧の取得に失敗しました");
    }
  }

  /**
   * 指定されたIDのバリスタを取得する
   *
   * @param id - 取得するバリスタのID
   * @returns バリスタエンティティ、存在しない場合はnull
   */
  async getBaristaById(id: string): Promise<Barista | null> {
    // IDが有効であることを検証
    try {
      const baristaId = BaristaId.parse(id);

      // トランザクションを使用して一貫性のあるデータ取得を保証
      return await this.prisma.$transaction(async (tx) => {
        // プロフィール情報の取得
        const profile = await tx.profile.findFirst({
          where: {
            id: baristaId.toString(),
            type: "barista",
          },
        });

        if (!profile) {
          return null;
        }

        // 評価件数取得
        const evaluationCount = await tx.evaluation.count({
          where: {
            baristaProfileId: baristaId.toString(),
          },
        });

        // データをドメインモデルに変換
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
      });
    } catch (error) {
      console.error("バリスタ取得エラー:", error);
      return null;
    }
  }

  /**
   * 新しいバリスタを作成する
   *
   * @param barista - 作成するバリスタのデータ
   * @returns 作成されたバリスタエンティティ
   * @throws バリデーションエラーや作成失敗時にエラーをスロー
   */
  async createBarista(
    barista: Omit<Barista, "id" | "createdAt" | "evaluationCount">,
  ): Promise<Barista> {
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

      // SNSリンクをJSON文字列に変換
      const snsLinksJson = barista.snsLinks ? JSON.stringify(barista.snsLinks) : null;

      // トランザクションを使用して一貫性のある操作を保証
      return await this.prisma.$transaction(async (tx) => {
        // プロフィールを作成
        await tx.profile.create({
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

        // 作成したバリスタを取得
        const createdBarista = await this.getBaristaById(baristaId.toString());
        if (!createdBarista) {
          throw new Error("バリスタの作成に失敗しました");
        }

        return createdBarista;
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`バリスタの作成に失敗しました: ${error.message}`);
      }
      throw new Error("バリスタの作成に失敗しました");
    }
  }

  /**
   * 既存のバリスタを更新する
   *
   * @param id - 更新するバリスタのID
   * @param barista - 更新するデータ（部分的な更新が可能）
   * @returns 更新されたバリスタエンティティ
   * @throws バリデーションエラーや更新失敗時にエラーをスロー
   */
  async updateBaristaById(id: string, barista: Partial<Barista>): Promise<Barista> {
    // バリデーション実行
    const parseResult = updateBaristaSchema.safeParse(barista);
    if (!parseResult.success) {
      throw new Error(`バリスタ更新データのバリデーションエラー: ${parseResult.error.message}`);
    }

    try {
      // IDが有効であることを検証
      const baristaId = BaristaId.parse(id);

      // SNSリンクをJSON文字列に変換
      const snsLinksJson = barista.snsLinks ? JSON.stringify(barista.snsLinks) : undefined;

      // トランザクションを使用して一貫性のある操作を保証
      return await this.prisma.$transaction(async (tx) => {
        // 指定されたIDのバリスタが存在するか確認
        const existingProfile = await tx.profile.findFirst({
          where: {
            id: baristaId.toString(),
            type: "barista",
          },
        });

        if (!existingProfile) {
          throw new Error("指定されたIDのバリスタが見つかりません");
        }

        // プロフィールを更新
        await tx.profile.update({
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

        // 更新したバリスタを取得
        const updatedBarista = await this.getBaristaById(baristaId.toString());
        if (!updatedBarista) {
          throw new Error("バリスタの更新に失敗しました");
        }

        return updatedBarista;
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`バリスタの更新に失敗しました: ${error.message}`);
      }
      throw new Error("バリスタの更新に失敗しました");
    }
  }

  /**
   * バリスタを削除する
   *
   * @param id - 削除するバリスタのID
   * @returns 削除が成功したかどうか
   * @throws 削除失敗時にエラーをスロー
   */
  async deleteBaristaById(id: string): Promise<boolean> {
    try {
      // IDが有効であることを検証
      const baristaId = BaristaId.parse(id);

      // トランザクションを使用して一貫性のある操作を保証
      return await this.prisma.$transaction(async (tx) => {
        // 指定されたIDのバリスタが存在するか確認
        const existingProfile = await tx.profile.findFirst({
          where: {
            id: baristaId.toString(),
            type: "barista",
          },
        });

        if (!existingProfile) {
          throw new Error("指定されたIDのバリスタが見つかりません");
        }

        // 関連するEvaluationを削除
        await tx.evaluation.deleteMany({
          where: {
            baristaProfileId: baristaId.toString(),
          },
        });

        // バリスタプロフィールを削除
        await tx.profile.delete({
          where: {
            id: baristaId.toString(),
          },
        });

        return true;
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`バリスタの削除に失敗しました: ${error.message}`);
      }
      throw new Error("バリスタの削除に失敗しました");
    }
  }
}
