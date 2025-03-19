import { describe, expect, it } from "vitest";

import {
  baristaSchema,
  createBaristaSchema,
  updateBaristaSchema,
} from "../../src/domain/entities/barista";
import { BaristaId, UserId } from "../../src/domain/value-objects/id";

describe("バリスタエンティティのテスト", () => {
  const validBaristaData = {
    id: BaristaId.generate().toString(),
    userId: UserId.generate().toString(),
    displayName: "テストバリスタ",
    iconUrl: "https://example.com/image.jpg",
    bio: "バリスタの自己紹介",
    snsLinks: ["https://twitter.com/test"],
    shopName: "テストカフェ",
    createdAt: new Date(),
    evaluationCount: 0,
  };

  describe("baristaSchema", () => {
    it("有効なデータを検証できること", () => {
      const result = baristaSchema.safeParse(validBaristaData);
      expect(result.success).toBe(true);
    });

    it("必須項目が欠けている場合はエラーになること", () => {
      const { displayName, ...invalidData } = validBaristaData;

      const result = baristaSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("表示名が長すぎる場合はエラーになること", () => {
      const invalidData = {
        ...validBaristaData,
        displayName: "a".repeat(51), // 50文字制限を超える
      };

      const result = baristaSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("iconUrlが無効なURLの場合はエラーになること", () => {
      const invalidData = {
        ...validBaristaData,
        iconUrl: "invalid-url",
      };

      const result = baristaSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("createBaristaSchema", () => {
    it("作成用の有効なデータを検証できること", () => {
      const createData = {
        userId: validBaristaData.userId,
        displayName: validBaristaData.displayName,
        iconUrl: validBaristaData.iconUrl,
        bio: validBaristaData.bio,
        snsLinks: validBaristaData.snsLinks,
        shopName: validBaristaData.shopName,
      };

      const result = createBaristaSchema.safeParse(createData);
      expect(result.success).toBe(true);
    });

    it("userId, displayNameは必須であること", () => {
      const invalidData = {
        iconUrl: validBaristaData.iconUrl,
        bio: validBaristaData.bio,
      };

      const result = createBaristaSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("updateBaristaSchema", () => {
    it("更新用の部分データを検証できること", () => {
      const updateData = {
        displayName: "更新された名前",
        bio: "更新された自己紹介",
      };

      const result = updateBaristaSchema.safeParse(updateData);
      expect(result.success).toBe(true);
    });

    it("空のオブジェクトでも更新は可能であること", () => {
      const result = updateBaristaSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("userId, id, createdAt, evaluationCountは更新できないこと", () => {
      const updateData = {
        id: "new-id",
        userId: "new-user-id",
        createdAt: new Date(),
        evaluationCount: 10,
        displayName: "更新名",
      };

      const result = updateBaristaSchema.safeParse(updateData);

      // スキーマ自体は成功するが、これらのフィールドは含まれていないはず
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).not.toHaveProperty("id");
        expect(result.data).not.toHaveProperty("userId");
        expect(result.data).not.toHaveProperty("createdAt");
        expect(result.data).not.toHaveProperty("evaluationCount");
        expect(result.data).toHaveProperty("displayName");
      }
    });
  });
});
