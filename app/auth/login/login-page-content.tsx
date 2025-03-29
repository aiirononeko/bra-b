"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { LoginForm } from "./login-form";

// URLパラメータを取得するためのラッパーコンポーネント
// Suspenseのエラーを回避するため
function MessageRetriever({
  onMessageReceived,
}: { onMessageReceived: (message: string | null) => void }) {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  // マウント時に一度だけ実行
  useEffect(() => {
    onMessageReceived(message);
  }, [message, onMessageReceived]);

  return null;
}

// メインのコンテンツコンポーネント
export function LoginPageContent() {
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      {/* Suspense境界でuseSearchParamsを使用するコンポーネントをラップ */}
      <Suspense fallback={null}>
        <MessageRetriever onMessageReceived={setMessage} />
      </Suspense>

      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">bra-B (ブラービ)</h1>
          <p className="text-gray-600 dark:text-gray-400">バリスタの価値を可視化するサービス</p>
        </div>

        <LoginForm initialMessage={message} />

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
          >
            ← トップページに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
