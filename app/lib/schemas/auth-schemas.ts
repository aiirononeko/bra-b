import { z } from "zod";

/**
 * 登録フォーム用のバリデーションスキーマ
 */
export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, { message: "メールアドレスは必須です" })
      .email({ message: "有効なメールアドレスを入力してください" }),
    password: z.string().min(6, { message: "パスワードは6文字以上で設定してください" }).optional(),
    confirmPassword: z.string().optional(),
    userType: z.enum(["customer", "barista"], {
      required_error: "ユーザータイプを選択してください",
    }),
    displayName: z
      .string()
      .min(1, { message: "表示名は必須です" })
      .max(50, { message: "表示名は50文字以内で入力してください" }),
    anonymousId: z.string().optional(),
    authType: z.enum(["password", "magic_link", "google"], {
      required_error: "認証タイプを選択してください",
    }),
  })
  .refine(
    (data) => {
      // パスワード認証の場合はパスワード必須
      if (data.authType === "password") {
        return !!data.password && data.password.length >= 6;
      }
      return true;
    },
    {
      message: "パスワード認証の場合、パスワードは6文字以上必須です",
      path: ["password"],
    }
  )
  .refine(
    (data) => {
      // パスワード認証の場合は確認用パスワードがパスワードと一致するか
      if (data.authType === "password" && data.password && data.confirmPassword) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: "パスワードが一致しません",
      path: ["confirmPassword"],
    }
  );

export type RegisterFormValues = z.infer<typeof registerSchema>;

/**
 * ログインフォーム用のバリデーションスキーマ
 */
export const loginSchema = z
  .object({
    email: z
      .string()
      .min(1, { message: "メールアドレスは必須です" })
      .email({ message: "有効なメールアドレスを入力してください" }),
    password: z.string().optional(),
    authType: z.enum(["password", "magic_link", "google"], {
      required_error: "認証タイプを選択してください",
    }),
    anonymousId: z.string().optional(), // 匿名IDを追加
  })
  .refine(
    (data) => {
      // パスワード認証の場合はパスワード必須
      if (data.authType === "password") {
        return !!data.password;
      }
      return true;
    },
    {
      message: "パスワード認証の場合、パスワードは必須です",
      path: ["password"],
    }
  );

export type LoginFormValues = z.infer<typeof loginSchema>;

/**
 * バリスタプロフィール作成用のバリデーションスキーマ
 */
export const baristaProfileSchema = z.object({
  displayName: z
    .string()
    .min(1, { message: "表示名は必須です" })
    .max(50, { message: "表示名は50文字以内で入力してください" }),
  shopName: z.string().max(100, { message: "店舗名は100文字以内で入力してください" }).optional(),
  bio: z.string().max(500, { message: "自己紹介は500文字以内で入力してください" }).optional(),
  snsLinks: z
    .object({
      instagram: z.string().optional(),
      twitter: z.string().optional(),
    })
    .optional(),
});

export type BaristaProfileFormValues = z.infer<typeof baristaProfileSchema>;

/**
 * カスタマープロフィール作成用のバリデーションスキーマ
 */
export const customerProfileSchema = z.object({
  displayName: z
    .string()
    .min(1, { message: "表示名は必須です" })
    .max(50, { message: "表示名は50文字以内で入力してください" }),
  bio: z.string().max(500, { message: "自己紹介は500文字以内で入力してください" }).optional(),
});

export type CustomerProfileFormValues = z.infer<typeof customerProfileSchema>;
