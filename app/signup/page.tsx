import type { Metadata } from "next";
import { SignupPageContent } from "./signup-page-content";

export const metadata: Metadata = {
  title: "アカウント登録 | Bra-B",
  description: "バリスタからチョイスするコーヒーマッチングサービス - アカウント登録",
};

// SearchParamsをより具体的に型付け
type SearchParams = { [key: string]: string | string[] | undefined };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // searchParamsをawaitして安全に使用
  const params = await searchParams;

  // SearchParamsを適切なオブジェクトに変換 (string | string[] -> string)
  const message =
    typeof params.message === "string"
      ? params.message
      : Array.isArray(params.message)
        ? params.message[0]
        : undefined;

  // 変換した値だけをクライアントコンポーネントに渡す
  const processedParams = { message };

  return <SignupPageContent searchParams={processedParams} />;
}
