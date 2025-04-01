"use client";

import { Suspense } from "react";
import { SignupForm } from "./signup-form";

interface MessageRetrieverProps {
  searchParams: { message?: string };
}

// URLからメッセージを取得するための単純なコンポーネント
function MessageRetriever({ searchParams }: MessageRetrieverProps) {
  return <SignupForm initialMessage={searchParams.message || null} />;
}

export function SignupPageContent({
  searchParams,
}: {
  searchParams: { message?: string };
}) {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="space-y-8 py-8 md:py-12">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">バリスタからチョイスするコーヒーマッチングサービス</h1>
          <p className="text-gray-500 dark:text-gray-400">
            アカウントを作成して、お気に入りのコーヒーを見つけましょう。
          </p>
        </div>
        <Suspense
          fallback={<div className="h-[400px] flex items-center justify-center">読み込み中...</div>}
        >
          <MessageRetriever searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
