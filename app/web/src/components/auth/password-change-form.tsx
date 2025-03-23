import { useState } from "react";
import { useChangePassword } from "../../hooks/use-auth";

/**
 * パスワード変更フォームのプロパティ
 *
 * @property onSuccess - 変更成功時のコールバック関数
 */
interface PasswordChangeFormProps {
  /** 変更成功時に実行されるコールバック関数 */
  onSuccess?: () => void;
}

/**
 * パスワード変更フォームコンポーネント
 *
 * ユーザーが自分のパスワードを変更するためのフォームを提供する
 * 入力検証とエラーハンドリングを含む
 *
 * @param props - コンポーネントのプロパティ
 * @returns パスワード変更フォームを表示するReactコンポーネント
 */
export const PasswordChangeForm = ({ onSuccess }: PasswordChangeFormProps) => {
  // フォームの状態管理
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  // パスワード変更操作のmutation
  const { mutate: changePassword, isPending } = useChangePassword();

  /**
   * 入力値のバリデーションを行う
   *
   * @returns バリデーションに成功したかどうか
   */
  const validateForm = (): boolean => {
    const errors: {
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    } = {};
    let isValid = true;

    // 現在のパスワードのバリデーション
    if (!currentPassword) {
      errors.currentPassword = "現在のパスワードを入力してください";
      isValid = false;
    }

    // 新しいパスワードのバリデーション
    if (!newPassword) {
      errors.newPassword = "新しいパスワードを入力してください";
      isValid = false;
    } else if (newPassword.length < 8) {
      errors.newPassword = "パスワードは8文字以上で入力してください";
      isValid = false;
    } else if (newPassword === currentPassword) {
      errors.newPassword = "新しいパスワードが現在のパスワードと同じです";
      isValid = false;
    }

    // パスワード確認のバリデーション
    if (!confirmPassword) {
      errors.confirmPassword = "パスワードの確認を入力してください";
      isValid = false;
    } else if (confirmPassword !== newPassword) {
      errors.confirmPassword = "パスワードが一致しません";
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
    setSuccessMessage(null);
    setValidationErrors({});

    // バリデーションチェック
    if (!validateForm()) {
      return;
    }

    try {
      // パスワード変更処理実行
      changePassword(
        { currentPassword, newPassword },
        {
          onSuccess: () => {
            // 変更成功時のメッセージ表示
            setSuccessMessage("パスワードが正常に変更されました");
            // フォームリセット
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            // 成功コールバック
            onSuccess?.();
          },
          onError: (error) => {
            // 変更失敗時のエラーハンドリング
            setError(error.message || "パスワードの変更に失敗しました");
            console.error("Password change error:", error);
          },
        },
      );
    } catch (err) {
      // 予期せぬエラーの処理
      setError("パスワード変更中にエラーが発生しました");
      console.error("Password change exception:", err);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
        aria-labelledby="password-change-heading"
        noValidate
      >
        <h2 id="password-change-heading" className="text-2xl font-bold mb-6 text-center">
          パスワード変更
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

        {/* 成功メッセージ表示 */}
        {successMessage && (
          <output
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
            aria-live="polite"
          >
            <span className="block sm:inline">{successMessage}</span>
          </output>
        )}

        {/* 現在のパスワード入力欄 */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="currentPassword">
            現在のパスワード
          </label>
          <input
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              validationErrors.currentPassword ? "border-red-500" : ""
            }`}
            id="currentPassword"
            name="currentPassword"
            type="password"
            placeholder="現在のパスワード"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            aria-required="true"
            aria-invalid={!!validationErrors.currentPassword}
            aria-describedby={
              validationErrors.currentPassword ? "currentPassword-error" : undefined
            }
            autoComplete="current-password"
          />
          {validationErrors.currentPassword && (
            <p id="currentPassword-error" className="text-red-500 text-xs italic mt-1">
              {validationErrors.currentPassword}
            </p>
          )}
        </div>

        {/* 新しいパスワード入力欄 */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newPassword">
            新しいパスワード
          </label>
          <input
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              validationErrors.newPassword ? "border-red-500" : ""
            }`}
            id="newPassword"
            name="newPassword"
            type="password"
            placeholder="新しいパスワード"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            aria-required="true"
            aria-invalid={!!validationErrors.newPassword}
            aria-describedby={validationErrors.newPassword ? "newPassword-error" : undefined}
            autoComplete="new-password"
          />
          {validationErrors.newPassword && (
            <p id="newPassword-error" className="text-red-500 text-xs italic mt-1">
              {validationErrors.newPassword}
            </p>
          )}
          <p className="text-gray-600 text-xs italic mt-1">
            パスワードは8文字以上で入力してください
          </p>
        </div>

        {/* パスワード確認入力欄 */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
            パスワード（確認）
          </label>
          <input
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              validationErrors.confirmPassword ? "border-red-500" : ""
            }`}
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="パスワード（確認）"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            aria-required="true"
            aria-invalid={!!validationErrors.confirmPassword}
            aria-describedby={
              validationErrors.confirmPassword ? "confirmPassword-error" : undefined
            }
            autoComplete="new-password"
          />
          {validationErrors.confirmPassword && (
            <p id="confirmPassword-error" className="text-red-500 text-xs italic mt-1">
              {validationErrors.confirmPassword}
            </p>
          )}
        </div>

        {/* アクションボタン */}
        <div className="flex items-center justify-center">
          <button
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200 ${
              isPending ? "opacity-50 cursor-not-allowed" : ""
            }`}
            type="submit"
            disabled={isPending}
            aria-busy={isPending}
          >
            {isPending ? "変更中..." : "パスワードを変更する"}
          </button>
        </div>
      </form>
    </div>
  );
};
