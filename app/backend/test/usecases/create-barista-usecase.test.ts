import { describe, expect, it, vi } from "vitest";

import { CreateBaristaUseCase } from "../../src/application/usecases/barista/create-barista-usecase";
import type { BaristaRepository } from "../../src/domain/repositories/barista-repository";
import type { Barista } from "../../src/domain/entities/barista";

describe("CreateBaristaUseCaseのテスト", () => {
  // 作成用データ
  const createData = {
    userId: "user-id-1",
    displayName: "新規バリスタ",
    iconUrl: "https://example.com/icon1.jpg",
    bio: "自己紹介文",
    snsLinks: ["https://twitter.com/test"],
    shopName: "テストカフェ",
  };

  // モック結果データ
  const mockCreatedBarista: Barista = {
    ...createData,
    id: "new-barista-id",
    createdAt: new Date(),
    evaluationCount: 0,
  };

  // リポジトリのモック
  const mockBaristaRepository: BaristaRepository = {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn().mockResolvedValue(mockCreatedBarista),
    update: vi.fn(),
  };

  it("バリスタを正常に作成できること", async () => {
    // ユースケースの初期化
    const createBaristaUseCase = new CreateBaristaUseCase(mockBaristaRepository);

    // ユースケースの実行
    const result = await createBaristaUseCase.execute(createData);

    // 検証
    expect(mockBaristaRepository.create).toHaveBeenCalledTimes(1);
    expect(mockBaristaRepository.create).toHaveBeenCalledWith(createData);
    expect(result).toEqual(mockCreatedBarista);
    expect(result.id).toBe("new-barista-id");
    expect(result.displayName).toBe("新規バリスタ");
    expect(result.evaluationCount).toBe(0);
  });

  it("リポジトリがエラーを投げた場合はエラーが伝播すること", async () => {
    // エラーを投げるモックを作成
    const errorMockRepository: BaristaRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn().mockRejectedValue(new Error("無効なデータ")),
      update: vi.fn(),
    };

    // ユースケースの初期化
    const createBaristaUseCase = new CreateBaristaUseCase(errorMockRepository);

    // エラーが伝播することを検証
    await expect(createBaristaUseCase.execute(createData)).rejects.toThrow("無効なデータ");
    expect(errorMockRepository.create).toHaveBeenCalledTimes(1);
  });
});
