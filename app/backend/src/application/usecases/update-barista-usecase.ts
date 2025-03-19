import type { Barista } from "../../domain/entities/barista";
import type { BaristaRepository } from "../../domain/repositories/barista-repository";

/**
 * バリスタ更新ユースケース
 */
export class UpdateBaristaUseCase {
  constructor(private readonly baristaRepository: BaristaRepository) {}

  /**
   * 指定IDのバリスタ情報を更新する
   * @param id バリスタID
   * @param data 更新データ
   */
  async execute(id: string, data: Partial<Barista>): Promise<Barista> {
    // TODO: 認証情報からユーザー自身のプロフィールかどうかを確認する
    // const currentUserId = ...
    // const barista = await this.baristaRepository.findById(id);
    // if (!barista || barista.userId !== currentUserId) {
    //   throw new Error("更新権限がありません");
    // }

    return this.baristaRepository.update(id, data);
  }
}
