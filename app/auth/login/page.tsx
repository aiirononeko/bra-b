// Next.jsのレンダリングとSuspenseの管理を最適化するために
// 一部のコンポーネントを分割します

import { LoginPageContent } from "./login-page-content";

// サーバーコンポーネントとしてページのエントリーポイントを作成
export default function LoginPage() {
  // クライアントコンポーネントにレンダリングを委任
  return <LoginPageContent />;
}
