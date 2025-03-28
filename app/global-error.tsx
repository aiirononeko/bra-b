"use client";

import Link from "next/link";

type GlobalErrorComponentProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalErrorComponent({ error, reset }: GlobalErrorComponentProps) {
  return (
    <html lang="ja">
      <body className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-12 h-12 mx-auto text-red-500"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            致命的なエラーが発生しました
          </h1>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            申し訳ありませんが、アプリケーションに問題が発生しました。
            <br />
            {process.env.NODE_ENV === "development" && (
              <span className="text-sm font-mono bg-gray-100 dark:bg-gray-700 p-1 rounded mt-2 block overflow-auto max-h-40">
                {error.message}
              </span>
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type="button"
              onClick={reset}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              もう一度試す
            </button>
            <a
              href="/"
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md transition-colors"
            >
              ホームに戻る
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
