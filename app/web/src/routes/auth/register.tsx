import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";

import { RegisterForm } from "../../components/auth/RegisterForm";
import { isAuthenticated } from "../../lib/auth";

export const Route = createFileRoute("/auth/register")({
  component: RegisterPage,
  beforeLoad: async () => {
    // すでにログインしている場合はダッシュボードへリダイレクト
    const isLoggedIn = await isAuthenticated();
    if (isLoggedIn) {
      throw redirect({ to: "/dashboard" });
    }
  },
});

function RegisterPage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-center">アカウント登録</h1>
      <RegisterForm onSuccess={() => navigate({ to: "/dashboard" })} />
    </div>
  );
}
