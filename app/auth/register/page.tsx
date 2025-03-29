// Next.jsのレンダリングとSuspenseの管理を最適化するために
// 一部のコンポーネントを分割します

import { RegisterPageContent } from "./register-page-content";

// サーバーコンポーネントとしてページのエントリーポイントを作成
export default function RegisterPage() {
  // クライアントコンポーネントにレンダリングを委任
  return <RegisterPageContent />;
}
