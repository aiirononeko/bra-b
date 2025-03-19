import { describe, expect, it, vi } from "vitest";

import { GetAllBaristasUseCase } from "../../src/application/usecases/barista/get-all-baristas-usecase";
import type { BaristaRepository } from "../../src/domain/repositories/barista-repository";
import type { BaristaListItem } from "../../src/domain/entities/barista";

describe("GetAllBaristasUseCaseのテスト", () => {
  // モックデータ
  const mockBaristas: BaristaListItem[] = [
    {
      id: "barista-id-1",
      displayName: "バリスタ1",
      iconUrl: "https://example.com/icon1.jpg",
      shopName: "カフェ1",
    },
    {
      id: "barista-id-2",
      displayName: "バリスタ2",
      iconUrl: "https://example.com/icon2.jpg",
      shopName: "カフェ2",
    },
  ];

  // リポジトリのモック
  const mockBaristaRepository: BaristaRepository = {
    findAll: vi.fn().mockResolvedValue(mockBaristas),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  };

  it("バリスタ一覧を取得できること", async () => {
    // ユースケースの初期化
    const getAllBaristasUseCase = new GetAllBaristasUseCase(mockBaristaRepository);

    // ユースケースの実行
    const result = await getAllBaristasUseCase.execute();

    // 検証
    expect(mockBaristaRepository.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockBaristas);
    expect(result.length).toBe(2);
    expect(result[0].displayName).toBe("バリスタ1");
    expect(result[1].displayName).toBe("バリスタ2");
  });

  it("リポジトリがエラーを投げた場合はエラーが伝播すること", async () => {
    // エラーを投げるモックを作成
    const errorMockRepository: BaristaRepository = {
      findAll: vi.fn().mockRejectedValue(new Error("DB接続エラー")),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    };

    // ユースケースの初期化
    const getAllBaristasUseCase = new GetAllBaristasUseCase(errorMockRepository);

    // エラーが伝播することを検証
    await expect(getAllBaristasUseCase.execute()).rejects.toThrow("DB接続エラー");
    expect(errorMockRepository.findAll).toHaveBeenCalledTimes(1);
  });
});
