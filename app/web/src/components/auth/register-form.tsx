import { useState } from "react";
import { useEmailSignUp } from "../../hooks/use-auth";

type RegisterFormProps = {
  onSuccess?: () => void;
};

export const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { mutate: signUp, isPending } = useEmailSignUp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("パスワードは8文字以上で入力してください。");
      return;
    }

    try {
      signUp(
        { email, password, name },
        {
          onSuccess: () => {
            onSuccess?.();
          },
          onError: (error) => {
            setError("登録に失敗しました。別のメールアドレスを試してください。");
            console.error("Register error:", error);
          },
        },
      );
    } catch (err) {
      setError("登録処理中にエラーが発生しました。");
      console.error("Register exception:", err);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold mb-6 text-center">アカウント登録</h2>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            名前
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="name"
            type="text"
            placeholder="名前"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            メールアドレス
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="email"
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            パスワード
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="password"
            type="password"
            placeholder="パスワード（8文字以上）"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          <p className="text-xs italic mt-1">パスワードは8文字以上で入力してください</p>
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
