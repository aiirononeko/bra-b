import { getPrismaClient } from "../prisma";
import { PrismaBaristaRepository } from "./prisma-barista-repository";
import type { BaristaRepository } from "../../domain/repositories/barista-repository";
import type { Env } from "../../types";

/**
 * バリスタリポジトリのインスタンスを取得
 * @param env 環境変数（D1データベースを含む）
 */
export function getBaristaRepository(env?: Env): BaristaRepository {
  const prisma = getPrismaClient(env);
  return new PrismaBaristaRepository(prisma);
}
