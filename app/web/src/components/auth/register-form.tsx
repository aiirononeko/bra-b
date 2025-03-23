import { useState } from "react";
import { useEmailSignUp } from "../../hooks/use-auth";
import { registerSchema, type RegisterFormValues } from "../../lib/validations/auth";

/**
 * アカウント登録フォームのプロパティ
 */
type RegisterFormProps = {
  /** 登録成功時のコールバック関数 */
  onSuccess?: () => void;
};

/**
 * アカウント登録フォームコンポーネント
 * Zodを使用したバリデーションとBetter Authを使用した認証を実装
 */
export const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  // フォーム入力値の状態
  const [formValues, setFormValues] = useState<RegisterFormValues>({
    name: "",
    email: "",
    password: "",
  });

  // フォームエラーの状態
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormValues, string>>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Partial<Record<keyof RegisterFormValues, boolean>>>({});

  // アカウント登録ミューテーション
  const { mutate: signUp, isPending } = useEmailSignUp();

  /**
   * 入力フィールドの変更ハンドラー
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));

    // フィールドがタッチされたことをマーク
    if (!touched[name as keyof RegisterFormValues]) {
      setTouched((prev) => ({
        ...prev,
        [name]: true,
      }));
    }

    // 変更時にそのフィールドのエラーをクリア
    if (errors[name as keyof RegisterFormValues]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  /**
   * フィールドのフォーカスが外れた際のバリデーション
   */
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;

    // フィールドがタッチされたことをマーク
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    // 単一フィールドのバリデーション
    validateField(name as keyof RegisterFormValues);
  };

  /**
   * 特定のフィールドのバリデーション
   */
  const validateField = (field: keyof RegisterFormValues) => {
    const result = registerSchema.shape[field].safeParse(formValues[field]);

    if (!result.success) {
      const error = result.error.format();
      setErrors((prev) => ({
        ...prev,
        [field]: error._errors?.[0] || `${field}が無効です`,
      }));
      return false;
    }

    // エラーをクリア
    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
    return true;
  };

  /**
   * フォーム全体のバリデーション
   */
  const validateForm = (): boolean => {
    const result = registerSchema.safeParse(formValues);

    if (!result.success) {
      const formattedErrors = result.error.format();

      // 各フィールドのエラーを設定
      const newErrors: Partial<Record<keyof RegisterFormValues, string>> = {};

      if (formattedErrors.name?._errors?.length) {
        newErrors.name = formattedErrors.name._errors[0];
      }

      if (formattedErrors.email?._errors?.length) {
        newErrors.email = formattedErrors.email._errors[0];
      }

      if (formattedErrors.password?._errors?.length) {
        newErrors.password = formattedErrors.password._errors[0];
      }

      setErrors(newErrors);

      // 全てのフィールドをタッチ済みにマーク
      setTouched({
        name: true,
        email: true,
        password: true,
      });

      return false;
    }

    // エラーをクリア
    setErrors({});
    return true;
  };

  /**
   * フォーム送信ハンドラー
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    // フォームバリデーション
    if (!validateForm()) {
      return;
    }

    try {
      signUp(formValues, {
        onSuccess: () => {
          onSuccess?.();
        },
        onError: (error) => {
          // API固有のエラーにもとづいて適切なエラーメッセージを表示
          if (error.code === "auth/email-already-in-use") {
            setGeneralError(
              "このメールアドレスは既に使用されています。別のメールアドレスを試してください。",
            );
          } else {
            setGeneralError(error.message || "登録に失敗しました。入力内容を確認してください。");
          }
          console.error("登録エラー:", error);
        },
      });
    } catch (err) {
      setGeneralError(
        "登録処理中に予期しないエラーが発生しました。時間をおいて再度お試しください。",
      );
      console.error("登録例外:", err);
    }
  };

  /**
   * 特定フィールドのエラーメッセージを取得
   */
  const getErrorMessage = (field: keyof RegisterFormValues): string | undefined => {
    return touched[field] ? errors[field] : undefined;
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold mb-6 text-center">アカウント登録</h2>

        {generalError && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <span className="block sm:inline">{generalError}</span>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            名前
          </label>
          <input
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              getErrorMessage("name") ? "border-red-500" : ""
            }`}
            id="name"
            name="name"
            type="text"
            placeholder="名前"
            value={formValues.name}
            onChange={handleChange}
            onBlur={handleBlur}
            required
          />
          {getErrorMessage("name") && (
            <p className="text-red-500 text-xs italic mt-1">{getErrorMessage("name")}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            メールアドレス
          </label>
          <input
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              getErrorMessage("email") ? "border-red-500" : ""
            }`}
            id="email"
            name="email"
            type="email"
            placeholder="メールアドレス"
            value={formValues.email}
            onChange={handleChange}
            onBlur={handleBlur}
            required
          />
          {getErrorMessage("email") && (
            <p className="text-red-500 text-xs italic mt-1">{getErrorMessage("email")}</p>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            パスワード
          </label>
          <input
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              getErrorMessage("password") ? "border-red-500" : ""
            }`}
            id="password"
            name="password"
            type="password"
            placeholder="パスワード（8文字以上）"
            value={formValues.password}
            onChange={handleChange}
            onBlur={handleBlur}
            required
          />
          {getErrorMessage("password") ? (
            <p className="text-red-500 text-xs italic mt-1">{getErrorMessage("password")}</p>
          ) : (
            <p className="text-xs text-gray-500 italic mt-1">
              パスワードは8文字以上で、少なくとも1つの小文字と1つの大文字または数字を含める必要があります
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <button
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
              isPending ? "opacity-50 cursor-not-allowed" : ""
            }`}
            type="submit"
            disabled={isPending}
          >
            {isPending ? "登録中..." : "登録する"}
          </button>
          <a
            className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
            href="/auth/login"
          >
            ログイン画面へ
          </a>
        </div>
      </form>
    </div>
  );
};
