import type { BaristaListItem } from "../../domain/entities/barista";
import type { BaristaRepository } from "../../domain/repositories/barista-repository";

/**
 * バリスタ一覧取得ユースケース
 */
export class GetAllBaristasUseCase {
  constructor(private readonly baristaRepository: BaristaRepository) {}

  /**
   * バリスタの一覧を取得する
   */
  async execute(): Promise<BaristaListItem[]> {
    return this.baristaRepository.findAll();
  }
}
