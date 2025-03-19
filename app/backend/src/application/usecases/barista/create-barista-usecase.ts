import type { Barista } from "../../../domain/entities/barista";
import type { BaristaRepository } from "../../../domain/repositories/barista-repository";

/**
 * バリスタ作成ユースケース
 */
export class CreateBaristaUseCase {
  constructor(private readonly baristaRepository: BaristaRepository) {}

  /**
   * 新しいバリスタを作成する
   * @param data バリスタ作成データ
   */
  async execute(data: Omit<Barista, "id" | "createdAt" | "evaluationCount">): Promise<Barista> {
    // ユースケース層で必要な追加のビジネスロジックがある場合はここに実装

    return this.baristaRepository.create(data);
  }
}
