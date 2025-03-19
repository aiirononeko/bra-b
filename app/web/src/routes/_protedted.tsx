import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { isAuthenticated } from "../lib/auth";

export const Route = createFileRoute("/_protedted")({
  component: ProtectedLayout,
  beforeLoad: async () => {
    // 未ログインの場合はログインページへリダイレクト
    const isLoggedIn = await isAuthenticated();
    if (!isLoggedIn) {
      throw redirect({ to: "/auth/login" });
    }
    return {};
  },
});

function ProtectedLayout() {
  return (
    <div className="protected-layout">
      <Outlet />
    </div>
  );
}
