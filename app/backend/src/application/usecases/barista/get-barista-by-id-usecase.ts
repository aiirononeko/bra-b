import type { Barista } from "../../../domain/entities/barista";
import type { BaristaRepository } from "../../../domain/repositories/barista-repository";

/**
 * バリスタ詳細取得ユースケース
 */
export class GetBaristaByIdUseCase {
  constructor(private readonly baristaRepository: BaristaRepository) {}

  /**
   * 指定IDのバリスタを取得する
   * @param id バリスタID
   */
  async execute(id: string): Promise<Barista | null> {
    return this.baristaRepository.findById(id);
  }
}
