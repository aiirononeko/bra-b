import type { PrismaClient } from "@prisma/client";
import type { User, CreateUserDTO } from "../domain/models/user.js";
import type { UserRepository } from "../domain/repositories/user-repository.js";

/**
 * Prismaを使用したユーザーリポジトリの実装
 */
export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * IDによるユーザー検索
   */
  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * メールアドレスによるユーザー検索
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * ユーザー作成
   */
  async create(userData: CreateUserDTO): Promise<User> {
    return this.prisma.user.create({
      data: userData,
    });
  }

  /**
   * ユーザー更新
   */
  async update(id: string, userData: Partial<User>): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: userData,
    });
  }

  /**
   * ユーザー論理削除
   */
  async delete(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
