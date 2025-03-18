import { PrismaClient } from "@prisma/client";
import { PrismaUserRepository } from "../repositories/prisma-user-repository.js";
import { PrismaProfileRepository } from "../repositories/prisma-profile-repository.js";
import type { UserRepository } from "../domain/repositories/user-repository.js";
import type { ProfileRepository } from "../domain/repositories/profile-repository.js";

// シングルトンのPrismaClientインスタンス
const prisma = new PrismaClient();

/**
 * ユーザーリポジトリの作成
 */
export function createUserRepository(): UserRepository {
  return new PrismaUserRepository(prisma);
}

/**
 * プロフィールリポジトリの作成
 */
export function createProfileRepository(): ProfileRepository {
  return new PrismaProfileRepository(prisma);
}
