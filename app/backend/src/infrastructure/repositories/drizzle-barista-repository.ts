import type { DrizzleD1Database } from "drizzle-orm/d1";
import { and, count, eq } from "drizzle-orm";
import type * as schema from "../../db/schema";
import { evaluations, profiles } from "../../db/schema";
import type { Barista, BaristaListItem } from "../../domain/entities/barista";
import {
  baristaSchema,
  createBaristaSchema,
  updateBaristaSchema,
} from "../../domain/entities/barista";
import type { BaristaRepository } from "../../domain/repositories/barista-repository";
import { BaristaId, UserId } from "../../domain/value-objects/id";

/**
 * DrizzleORM実装のバリスタリポジトリ
 */
export class DrizzleBaristaRepository implements BaristaRepository {
  constructor(private readonly db: DrizzleD1Database<typeof schema>) {}

  async findAll(): Promise<BaristaListItem[]> {
    // バリスタ（プロフィールタイプが'barista'）の一覧を取得
    const results = await this.db
      .select({
        id: profiles.id,
        displayName: profiles.displayName,
        iconUrl: profiles.iconUrl,
        shopName: profiles.shopName,
      })
      .from(profiles)
      .where(eq(profiles.type, "barista"));

    return results.map((result) => ({
      id: result.id, // 自動的にバリデーションが行われる
      displayName: result.displayName,
      iconUrl: result.iconUrl ?? undefined,
      shopName: result.shopName ?? undefined,
    }));
  }

  async findById(id: string): Promise<Barista | null> {
    // IDの検証
    try {
      const baristaId = BaristaId.parse(id);

      const result = await this.db
        .select()
        .from(profiles)
        .where(and(eq(profiles.id, baristaId.toString()), eq(profiles.type, "barista")));

      if (result.length === 0) {
        return null;
      }

      // 評価件数取得
      const evaluationResult = await this.db
        .select({ count: count() })
        .from(evaluations)
        .where(eq(evaluations.baristaProfileId, baristaId.toString()));

      const evaluationCount = evaluationResult[0]?.count ?? 0;

      const profile = result[0];
      const baristaData = {
        id: profile.id,
        userId: profile.userId,
        displayName: profile.displayName,
        iconUrl: profile.iconUrl ?? undefined,
        bio: profile.bio ?? undefined,
        snsLinks: profile.snsLinks ? JSON.parse(profile.snsLinks) : undefined,
        shopName: profile.shopName ?? undefined,
        createdAt: new Date(profile.createdAt),
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

      await this.db.insert(profiles).values({
        id: baristaId.toString(),
        userId: userId.toString(),
        type: "barista",
        displayName: barista.displayName,
        iconUrl: barista.iconUrl ?? null,
        bio: barista.bio ?? null,
        snsLinks: snsLinksJson,
        shopName: barista.shopName ?? null,
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

      await this.db
        .update(profiles)
        .set({
          displayName: barista.displayName,
          iconUrl: barista.iconUrl,
          bio: barista.bio,
          snsLinks: snsLinksJson,
          shopName: barista.shopName,
        })
        .where(and(eq(profiles.id, baristaId.toString()), eq(profiles.type, "barista")));

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
