import { z } from "zod";
import { baristaIdSchema, userIdSchema } from "../value-objects/id";

/**
 * バリスタエンティティのZodスキーマ
 */
export const baristaSchema = z.object({
  id: baristaIdSchema,
  userId: userIdSchema,
  displayName: z
    .string()
    .min(1, "表示名は必須です")
    .max(50, "表示名は50文字以内で入力してください"),
  iconUrl: z.string().url("有効なURLを入力してください").optional(),
  bio: z.string().max(500, "自己紹介は500文字以内で入力してください").optional(),
  snsLinks: z.array(z.string().url("有効なURLを入力してください")).optional(),
  shopName: z.string().max(100, "店舗名は100文字以内で入力してください").optional(),
  createdAt: z.date(),
  evaluationCount: z.number().int().nonnegative(),
});

/**
 * バリスタ一覧表示用のZodスキーマ
 */
export const baristaListItemSchema = z.object({
  id: baristaIdSchema,
  displayName: z.string(),
  iconUrl: z.string().url().optional(),
  shopName: z.string().optional(),
});

/**
 * バリスタ作成用のZodスキーマ
 */
export const createBaristaSchema = baristaSchema.omit({
  id: true,
  createdAt: true,
  evaluationCount: true,
});

/**
 * バリスタ更新用のZodスキーマ
 */
export const updateBaristaSchema = baristaSchema.partial().omit({
  id: true,
  userId: true,
  createdAt: true,
  evaluationCount: true,
});

/**
 * 型安全なバリスタエンティティの型
 */
export type Barista = z.infer<typeof baristaSchema>;

/**
 * 型安全なバリスタ一覧表示用の型
 */
export type BaristaListItem = z.infer<typeof baristaListItemSchema>;

/**
 * 型安全なバリスタ作成用の型
 */
export type CreateBaristaType = z.infer<typeof createBaristaSchema>;

/**
 * 型安全なバリスタ更新用の型
 */
export type UpdateBaristaType = z.infer<typeof updateBaristaSchema>;
