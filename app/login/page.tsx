import { LoginPageContent } from "./login-page-content";

// サーバーコンポーネントとしてページのエントリーポイントを作成
export default function LoginPage() {
  // auth/loginのクライアントコンポーネントにレンダリングを委任
  return <LoginPageContent />;
}
