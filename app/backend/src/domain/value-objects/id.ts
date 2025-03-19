import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

/**
 * ID用の基底クラス
 * すべてのID型の親クラスとなる
 */
export abstract class Id {
  constructor(protected readonly value: string) {
    if (!this.validate(value)) {
      throw new Error(`無効なID形式です: ${value}`);
    }
  }

  /**
   * ID値を検証する
   */
  protected abstract validate(value: string): boolean;

  /**
   * ID値を文字列として取得
   */
  toString(): string {
    return this.value;
  }

  /**
   * 別のIDと等価かどうかを判断
   */
  equals(other: Id): boolean {
    return this.value === other.value;
  }
}

/**
 * UUID形式のID用バリューオブジェクト
 */
export class UuidId extends Id {
  // UUID形式の正規表現
  static readonly UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  /**
   * 新しいUUIDを生成
   */
  static generate(): UuidId {
    return new UuidId(uuidv4());
  }

  /**
   * 文字列からUuidIdを作成（検証付き）
   */
  static parse(value: string): UuidId {
    return new UuidId(value);
  }

  /**
   * 安全にパースを試みる
   */
  static safeParse(
    value: unknown,
  ): { success: true; data: UuidId } | { success: false; error: Error } {
    if (typeof value !== "string") {
      return { success: false, error: new Error("IDは文字列である必要があります") };
    }

    try {
      const id = new UuidId(value);
      return { success: true, data: id };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error("不明なエラー") };
    }
  }

  /**
   * UUID形式を検証
   */
  protected validate(value: string): boolean {
    return UuidId.UUID_REGEX.test(value);
  }
}

/**
 * ユーザーID用のバリューオブジェクト
 */
export class UserId extends UuidId {
  static generate(): UserId {
    return new UserId(uuidv4());
  }

  static parse(value: string): UserId {
    return new UserId(value);
  }
}

/**
 * バリスタID用のバリューオブジェクト
 */
export class BaristaId extends UuidId {
  static generate(): BaristaId {
    return new BaristaId(uuidv4());
  }

  static parse(value: string): BaristaId {
    return new BaristaId(value);
  }
}

/**
 * Zodスキーマで使用するためのカスタムバリデーション
 */
export const uuidIdSchema = z
  .string()
  .refine((value) => UuidId.UUID_REGEX.test(value), {
    message: "有効なUUID形式である必要があります",
  });

export const userIdSchema = uuidIdSchema;
export const baristaIdSchema = uuidIdSchema;
