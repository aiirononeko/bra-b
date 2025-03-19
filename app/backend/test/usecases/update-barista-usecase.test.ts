import { describe, expect, it, vi } from "vitest";

import { UpdateBaristaUseCase } from "../../src/application/usecases/barista/update-barista-usecase";
import type { BaristaRepository } from "../../src/domain/repositories/barista-repository";
import type { Barista } from "../../src/domain/entities/barista";

describe("UpdateBaristaUseCaseのテスト", () => {
  // 既存のバリスタデータ
  const existingBarista: Barista = {
    id: "barista-id-1",
    userId: "user-id-1",
    displayName: "既存バリスタ",
    iconUrl: "https://example.com/old-icon.jpg",
    bio: "古い自己紹介",
    snsLinks: ["https://twitter.com/old"],
    shopName: "古いカフェ",
    createdAt: new Date("2023-01-01"),
    evaluationCount: 10,
  };

  // 更新用データ
  const updateData = {
    displayName: "更新後のバリスタ",
    bio: "新しい自己紹介",
    iconUrl: "https://example.com/new-icon.jpg",
  };

  // 更新後のデータ
  const updatedBarista: Barista = {
    ...existingBarista,
    ...updateData,
  };

  // リポジトリのモック
  const mockBaristaRepository: BaristaRepository = {
    findAll: vi.fn(),
    findById: vi.fn().mockResolvedValue(existingBarista),
    create: vi.fn(),
    update: vi.fn().mockResolvedValue(updatedBarista),
  };

  it("バリスタ情報を正常に更新できること", async () => {
    // ユースケースの初期化
    const updateBaristaUseCase = new UpdateBaristaUseCase(mockBaristaRepository);

    // ユースケースの実行
    const result = await updateBaristaUseCase.execute("barista-id-1", updateData);

    // 検証
    expect(mockBaristaRepository.update).toHaveBeenCalledTimes(1);
    expect(mockBaristaRepository.update).toHaveBeenCalledWith("barista-id-1", updateData);
    expect(result).toEqual(updatedBarista);
    expect(result.displayName).toBe("更新後のバリスタ");
    expect(result.bio).toBe("新しい自己紹介");
    expect(result.iconUrl).toBe("https://example.com/new-icon.jpg");
    // 更新されていないフィールドは元の値を保持していること
    expect(result.id).toBe("barista-id-1");
    expect(result.userId).toBe("user-id-1");
    expect(result.evaluationCount).toBe(10);
  });

  it("リポジトリがエラーを投げた場合はエラーが伝播すること", async () => {
    // エラーを投げるモックを作成
    const errorMockRepository: BaristaRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn().mockRejectedValue(new Error("更新エラー")),
    };

    // ユースケースの初期化
    const updateBaristaUseCase = new UpdateBaristaUseCase(errorMockRepository);

    // エラーが伝播することを検証
    await expect(updateBaristaUseCase.execute("barista-id-1", updateData)).rejects.toThrow(
      "更新エラー",
    );
    expect(errorMockRepository.update).toHaveBeenCalledTimes(1);
  });

  // TODO: 認証関連のテストは認証機能実装後に追加
  // it("自分のプロフィール以外は更新できないこと", async () => {
  //   // 実装予定
  // });
});
