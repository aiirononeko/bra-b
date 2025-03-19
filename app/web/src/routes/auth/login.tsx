import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";

import { LoginForm } from "../../components/auth/LoginForm";
import { isAuthenticated } from "../../lib/auth";

export const Route = createFileRoute("/auth/login")({
  component: LoginPage,
  beforeLoad: async () => {
    // すでにログインしている場合はダッシュボードへリダイレクト
    const isLoggedIn = await isAuthenticated();
    if (isLoggedIn) {
      throw redirect({ to: "/dashboard" });
    }
  },
});

function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-center">ログイン</h1>
      <LoginForm onSuccess={() => navigate({ to: "/dashboard" })} />
    </div>
  );
}
