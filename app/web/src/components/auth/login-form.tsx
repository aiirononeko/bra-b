import { useState } from "react";
import { useEmailSignIn } from "../../hooks/use-auth";
import { loginSchema, type LoginFormValues } from "../../lib/validations/auth";

/**
 * ログインフォームのプロパティ
 */
interface LoginFormProps {
  /** ログイン成功時に実行されるコールバック関数 */
  onSuccess?: () => void;
}

/**
 * ログインフォームコンポーネント
 *
 * Zodを使用したバリデーションとBetter Authを使用した認証を実装したログインフォーム
 */
export const LoginForm = ({ onSuccess }: LoginFormProps) => {
  // フォーム入力値の状態
  const [formValues, setFormValues] = useState<LoginFormValues>({
    email: "",
    password: "",
    rememberMe: true,
  });

  // フォームエラーの状態
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormValues, string>>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Partial<Record<keyof LoginFormValues, boolean>>>({});

  // ログイン操作のmutation
  const { mutate: signIn, isPending } = useEmailSignIn();

  /**
   * 入力フィールドの変更ハンドラー
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    // チェックボックスの場合は checked 値を使用
    const fieldValue = type === "checkbox" ? checked : value;

    setFormValues((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));

    // フィールドがタッチされたことをマーク
    if (!touched[name as keyof LoginFormValues]) {
      setTouched((prev) => ({
        ...prev,
        [name]: true,
      }));
    }

    // 変更時にそのフィールドのエラーをクリア
    if (errors[name as keyof LoginFormValues]) {
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
    validateField(name as keyof LoginFormValues);
  };

  /**
   * 特定のフィールドのバリデーション
   */
  const validateField = (field: keyof LoginFormValues) => {
    const result = loginSchema.shape[field].safeParse(formValues[field]);

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
    const result = loginSchema.safeParse(formValues);

    if (!result.success) {
      const formattedErrors = result.error.format();

      // 各フィールドのエラーを設定
      const newErrors: Partial<Record<keyof LoginFormValues, string>> = {};

      if (formattedErrors.email?._errors?.length) {
        newErrors.email = formattedErrors.email._errors[0];
      }

      if (formattedErrors.password?._errors?.length) {
        newErrors.password = formattedErrors.password._errors[0];
      }

      setErrors(newErrors);

      // 全てのフィールドをタッチ済みにマーク
      setTouched({
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
      // ログイン処理実行
      signIn(formValues, {
        onSuccess: () => {
          // ログイン成功時のコールバック
          onSuccess?.();
        },
        onError: (error) => {
          // ログイン失敗時のエラーハンドリング
          if (error.code === "auth/invalid-credentials") {
            setGeneralError("メールアドレスまたはパスワードが正しくありません。");
          } else {
            setGeneralError(
              error.message || "ログインに失敗しました。認証情報を確認してください。",
            );
          }
          console.error("ログインエラー:", error);
        },
      });
    } catch (err) {
      // 予期せぬエラーの処理
      setGeneralError(
        "ログイン処理中に予期しないエラーが発生しました。時間をおいて再度お試しください。",
      );
      console.error("ログイン例外:", err);
    }
  };

  /**
   * 特定フィールドのエラーメッセージを取得
   */
  const getErrorMessage = (field: keyof LoginFormValues): string | undefined => {
    return touched[field] ? errors[field] : undefined;
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
        aria-labelledby="login-heading"
        noValidate
      >
        <h2 id="login-heading" className="text-2xl font-bold mb-6 text-center">
          ログイン
        </h2>

        {/* エラーメッセージ表示 */}
        {generalError && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
            aria-live="polite"
          >
            <span className="block sm:inline">{generalError}</span>
          </div>
        )}

        {/* メールアドレス入力欄 */}
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
            aria-required="true"
            aria-invalid={!!getErrorMessage("email")}
            aria-describedby={getErrorMessage("email") ? "email-error" : undefined}
            autoComplete="email"
          />
          {getErrorMessage("email") && (
            <p id="email-error" className="text-red-500 text-xs italic mt-1">
              {getErrorMessage("email")}
            </p>
          )}
        </div>

        {/* パスワード入力欄 */}
        <div className="mb-4">
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
            placeholder="パスワード"
            value={formValues.password}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            aria-required="true"
            aria-invalid={!!getErrorMessage("password")}
            aria-describedby={getErrorMessage("password") ? "password-error" : undefined}
            autoComplete="current-password"
          />
          {getErrorMessage("password") && (
            <p id="password-error" className="text-red-500 text-xs italic mt-1">
              {getErrorMessage("password")}
            </p>
          )}
        </div>

        {/* リメンバーミー */}
        <div className="mb-6">
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="rememberMe"
              className="form-checkbox h-4 w-4 text-blue-500 transition duration-150 ease-in-out"
              checked={formValues.rememberMe}
              onChange={handleChange}
            />
            <span className="ml-2 text-sm text-gray-700">ログイン状態を保持する</span>
          </label>
        </div>

        {/* アクションボタン */}
        <div className="flex items-center justify-between">
          <button
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200 ${
              isPending ? "opacity-50 cursor-not-allowed" : ""
            }`}
            type="submit"
            disabled={isPending}
            aria-busy={isPending}
          >
            {isPending ? "ログイン中..." : "ログイン"}
          </button>
          <a
            className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800 transition-colors duration-200"
            href="/auth/register"
          >
            アカウント登録
          </a>
        </div>
      </form>
    </div>
  );
};
