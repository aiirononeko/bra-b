import { useState } from "react";
import { useEmailSignIn } from "../../hooks/use-auth";

/**
 * ログインフォームのプロパティ
 *
 * @property onSuccess - ログイン成功時のコールバック関数
 */
interface LoginFormProps {
  /** ログイン成功時に実行されるコールバック関数 */
  onSuccess?: () => void;
}

/**
 * ログインフォームコンポーネント
 *
 * ユーザーがメールアドレスとパスワードでログインするためのフォームを提供する
 * 入力検証とエラーハンドリングを含む
 *
 * @param props - コンポーネントのプロパティ
 * @returns ログインフォームを表示するReactコンポーネント
 */
export const LoginForm = ({ onSuccess }: LoginFormProps) => {
  // フォームの状態管理
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  // ログイン操作のmutation
  const { mutate: signIn, isPending } = useEmailSignIn();

  /**
   * 入力値のバリデーションを行う
   *
   * @returns バリデーションに成功したかどうか
   */
  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};
    let isValid = true;

    // メールアドレスのバリデーション
    if (!email) {
      errors.email = "メールアドレスを入力してください";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "有効なメールアドレスを入力してください";
      isValid = false;
    }

    // パスワードのバリデーション
    if (!password) {
      errors.password = "パスワードを入力してください";
      isValid = false;
    } else if (password.length < 8) {
      errors.password = "パスワードは8文字以上で入力してください";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  /**
   * フォーム送信時の処理
   *
   * @param e - フォーム送信イベント
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // フォームの状態をリセット
    setError(null);
    setValidationErrors({});

    // バリデーションチェック
    if (!validateForm()) {
      return;
    }

    try {
      // ログイン処理実行
      signIn(
        { email, password },
        {
          onSuccess: () => {
            // ログイン成功時のコールバック
            onSuccess?.();
          },
          onError: (error) => {
            // ログイン失敗時のエラーハンドリング
            setError("ログインに失敗しました。メールアドレスとパスワードを確認してください。");
            console.error("Login error:", error);
          },
        },
      );
    } catch (err) {
      // 予期せぬエラーの処理
      setError("ログイン処理中にエラーが発生しました。");
      console.error("Login exception:", err);
    }
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
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
            aria-live="polite"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* メールアドレス入力欄 */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            メールアドレス
          </label>
          <input
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              validationErrors.email ? "border-red-500" : ""
            }`}
            id="email"
            name="email"
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-required="true"
            aria-invalid={!!validationErrors.email}
            aria-describedby={validationErrors.email ? "email-error" : undefined}
            autoComplete="email"
          />
          {validationErrors.email && (
            <p id="email-error" className="text-red-500 text-xs italic mt-1">
              {validationErrors.email}
            </p>
          )}
        </div>

        {/* パスワード入力欄 */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            パスワード
          </label>
          <input
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              validationErrors.password ? "border-red-500" : ""
            }`}
            id="password"
            name="password"
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            aria-required="true"
            aria-invalid={!!validationErrors.password}
            aria-describedby={validationErrors.password ? "password-error" : undefined}
            autoComplete="current-password"
          />
          {validationErrors.password && (
            <p id="password-error" className="text-red-500 text-xs italic mt-1">
              {validationErrors.password}
            </p>
          )}
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
