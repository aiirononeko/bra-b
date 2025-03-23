import { useState, useEffect } from "react";
import { useUpdateProfile } from "../../hooks/use-auth";
import type { AuthUser } from "../../lib/auth";

/**
 * プロフィールフォームのプロパティ
 *
 * @property user - 現在のユーザー情報
 * @property onSuccess - 更新成功時のコールバック関数
 */
interface ProfileFormProps {
  /** 現在のユーザー情報 */
  user: AuthUser | null | undefined;
  /** 更新成功時に実行されるコールバック関数 */
  onSuccess?: () => void;
}

/**
 * プロフィール編集フォームコンポーネント
 *
 * ユーザーが自分のプロフィール情報（名前、アバター）を更新するためのフォームを提供する
 * 入力検証とエラーハンドリングを含む
 *
 * @param props - コンポーネントのプロパティ
 * @returns プロフィール編集フォームを表示するReactコンポーネント
 */
export const ProfileForm = ({ user, onSuccess }: ProfileFormProps) => {
  // フォームの状態管理
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    avatar?: string;
  }>({});

  // ユーザー情報が変更されたときにフォーム状態を更新
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setAvatar((user.avatar as string) || "");
    }
  }, [user]);

  // プロフィール更新操作のmutation
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  /**
   * 入力値のバリデーションを行う
   *
   * @returns バリデーションに成功したかどうか
   */
  const validateForm = (): boolean => {
    const errors: { name?: string; avatar?: string } = {};
    let isValid = true;

    // 名前のバリデーション (必須)
    if (!name) {
      errors.name = "名前を入力してください";
      isValid = false;
    } else if (name.length > 50) {
      errors.name = "名前は50文字以内で入力してください";
      isValid = false;
    }

    // アバターURLのバリデーション (任意)
    if (avatar && !/^(https?:\/\/).+/.test(avatar)) {
      errors.avatar = "有効なURL（http://またはhttps://で始まる）を入力してください";
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
      // プロフィール更新データの作成
      const updateData = {
        name,
        avatar: avatar || undefined,
      };

      // 更新処理実行
      updateProfile(updateData, {
        onSuccess: () => {
          // 更新成功時のメッセージ表示
          setSuccessMessage("プロフィールが正常に更新されました");
          // 成功コールバック
          onSuccess?.();
        },
        onError: (error) => {
          // 更新失敗時のエラーハンドリング
          setError(error.message || "プロフィールの更新に失敗しました");
          console.error("Profile update error:", error);
        },
      });
    } catch (err) {
      // 予期せぬエラーの処理
      setError("プロフィール更新中にエラーが発生しました");
      console.error("Profile update exception:", err);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
        aria-labelledby="profile-heading"
        noValidate
      >
        <h2 id="profile-heading" className="text-2xl font-bold mb-6 text-center">
          プロフィール編集
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

        {/* 名前入力欄 */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            名前
          </label>
          <input
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              validationErrors.name ? "border-red-500" : ""
            }`}
            id="name"
            name="name"
            type="text"
            placeholder="名前"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            aria-required="true"
            aria-invalid={!!validationErrors.name}
            aria-describedby={validationErrors.name ? "name-error" : undefined}
          />
          {validationErrors.name && (
            <p id="name-error" className="text-red-500 text-xs italic mt-1">
              {validationErrors.name}
            </p>
          )}
        </div>

        {/* アバター入力欄 */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="avatar">
            アバターURL（任意）
          </label>
          <input
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              validationErrors.avatar ? "border-red-500" : ""
            }`}
            id="avatar"
            name="avatar"
            type="url"
            placeholder="https://example.com/avatar.jpg"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            aria-invalid={!!validationErrors.avatar}
            aria-describedby={validationErrors.avatar ? "avatar-error" : undefined}
          />
          {validationErrors.avatar && (
            <p id="avatar-error" className="text-red-500 text-xs italic mt-1">
              {validationErrors.avatar}
            </p>
          )}
          {avatar && (
            <div className="mt-2">
              <p className="text-sm text-gray-600 mb-1">プレビュー:</p>
              <img
                src={avatar}
                alt="アバタープレビュー"
                className="w-16 h-16 object-cover rounded-full border"
                onError={(e) => {
                  // 画像読み込みエラー時にプレースホルダーを表示
                  (e.target as HTMLImageElement).src =
                    "https://via.placeholder.com/150?text=Invalid+URL";
                }}
              />
            </div>
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
            {isPending ? "更新中..." : "更新する"}
          </button>
        </div>
      </form>
    </div>
  );
};
