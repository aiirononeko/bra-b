import { z } from "zod";

/**
 * アカウント登録フォームのバリデーションスキーマ
 */
export const registerSchema = z.object({
  name: z.string().min(1, "名前は必須です").max(50, "名前は50文字以内で入力してください"),
  email: z
    .string()
    .min(1, "メールアドレスは必須です")
    .email("有効なメールアドレスを入力してください"),
  password: z
    .string()
    .min(8, "パスワードは8文字以上で入力してください")
    .max(100, "パスワードは100文字以内で入力してください")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z0-9]).*$/,
      "パスワードは少なくとも1つの小文字と、1つの大文字または数字を含める必要があります",
    ),
});

/**
 * アカウント登録フォームの入力値の型
 */
export type RegisterFormValues = z.infer<typeof registerSchema>;

/**
 * ログインフォームのバリデーションスキーマ
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "メールアドレスは必須です")
    .email("有効なメールアドレスを入力してください"),
  password: z.string().min(1, "パスワードは必須です"),
  rememberMe: z.boolean().optional().default(true),
});

/**
 * ログインフォームの入力値の型
 */
export type LoginFormValues = z.infer<typeof loginSchema>;

/**
 * パスワード変更フォームのバリデーションスキーマ
 */
export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "現在のパスワードは必須です"),
    newPassword: z
      .string()
      .min(8, "新しいパスワードは8文字以上で入力してください")
      .max(100, "新しいパスワードは100文字以内で入力してください")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z0-9]).*$/,
        "パスワードは少なくとも1つの小文字と、1つの大文字または数字を含める必要があります",
      ),
    confirmPassword: z.string().min(1, "確認用パスワードは必須です"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "新しいパスワードと確認用パスワードが一致しません",
    path: ["confirmPassword"],
  });

/**
 * パスワード変更フォームの入力値の型
 */
export type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>;
