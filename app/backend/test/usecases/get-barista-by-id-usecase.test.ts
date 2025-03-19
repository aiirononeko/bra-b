import { describe, expect, it, vi } from "vitest";

import { GetBaristaByIdUseCase } from "../../src/application/usecases/barista/get-barista-by-id-usecase";
import type { BaristaRepository } from "../../src/domain/repositories/barista-repository";
import type { Barista } from "../../src/domain/entities/barista";

describe("GetBaristaByIdUseCaseのテスト", () => {
  // モックバリスタデータ
  const mockBarista: Barista = {
    id: "barista-id-1",
    userId: "user-id-1",
    displayName: "テストバリスタ",
    iconUrl: "https://example.com/icon1.jpg",
    bio: "自己紹介文",
    snsLinks: ["https://twitter.com/test"],
    shopName: "テストカフェ",
    createdAt: new Date(),
    evaluationCount: 5,
  };

  // リポジトリのモック作成
  const mockBaristaRepository: BaristaRepository = {
    findAll: vi.fn(),
    findById: vi.fn().mockResolvedValue(mockBarista),
    create: vi.fn(),
    update: vi.fn(),
  };

  it("指定IDのバリスタを取得できること", async () => {
    // ユースケースの初期化
    const getBaristaByIdUseCase = new GetBaristaByIdUseCase(mockBaristaRepository);

    // ユースケースの実行
    const result = await getBaristaByIdUseCase.execute("barista-id-1");

    // 検証
    expect(mockBaristaRepository.findById).toHaveBeenCalledTimes(1);
    expect(mockBaristaRepository.findById).toHaveBeenCalledWith("barista-id-1");
    expect(result).toEqual(mockBarista);
    expect(result?.displayName).toBe("テストバリスタ");
  });

  it("存在しないIDの場合はnullが返ること", async () => {
    // nullを返すモックを作成
    const notFoundMockRepository: BaristaRepository = {
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
      update: vi.fn(),
    };

    // ユースケースの初期化
    const getBaristaByIdUseCase = new GetBaristaByIdUseCase(notFoundMockRepository);

    // ユースケースの実行
    const result = await getBaristaByIdUseCase.execute("not-exist-id");

    // 検証
    expect(notFoundMockRepository.findById).toHaveBeenCalledTimes(1);
    expect(notFoundMockRepository.findById).toHaveBeenCalledWith("not-exist-id");
    expect(result).toBeNull();
  });

  it("リポジトリがエラーを投げた場合はエラーが伝播すること", async () => {
    // エラーを投げるモックを作成
    const errorMockRepository: BaristaRepository = {
      findAll: vi.fn(),
      findById: vi.fn().mockRejectedValue(new Error("DB接続エラー")),
      create: vi.fn(),
      update: vi.fn(),
    };

    // ユースケースの初期化
    const getBaristaByIdUseCase = new GetBaristaByIdUseCase(errorMockRepository);

    // エラーが伝播することを検証
    await expect(getBaristaByIdUseCase.execute("barista-id")).rejects.toThrow("DB接続エラー");
    expect(errorMockRepository.findById).toHaveBeenCalledTimes(1);
  });
});
