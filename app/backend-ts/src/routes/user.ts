import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { createUserService } from "../factories/service-factory.js";

const userRoutes = new Hono();
const userService = createUserService();

// 認証ミドルウェア
userRoutes.use(
  "*",
  jwt({
    secret: process.env.JWT_SECRET || "fallback-secret",
  }),
);

// ログインユーザー情報の取得
userRoutes.get("/me", async (c) => {
  const payload = c.get("jwtPayload");
  const userId = payload.sub;

  const userWithProfile = await userService.getUserWithProfile(userId);

  if (!userWithProfile) {
    return c.json({ message: "User not found" }, 404);
  }

  return c.json(userWithProfile);
});

export { userRoutes };
