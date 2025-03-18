import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { jwt } from "hono/jwt";

const favoriteRoutes = new Hono();

// 認証ミドルウェア
favoriteRoutes.use(
  "/*",
  jwt({
    secret: process.env.JWT_SECRET || "fallback-secret",
  }),
);

// お気に入り追加のスキーマ
const addFavoriteSchema = z.object({
  baristaId: z.string().uuid(),
});

// お気に入り追加
favoriteRoutes.post("/", zValidator("json", addFavoriteSchema), async (c) => {
  const payload = c.get("jwtPayload");
  const userId = payload.sub;
  const { baristaId } = c.req.valid("json");

  // お気に入り追加処理（実装予定）

  return c.json({ message: "Favorite added successfully" }, 201);
});

// お気に入り削除
favoriteRoutes.delete("/:baristaId", async (c) => {
  const payload = c.get("jwtPayload");
  const userId = payload.sub;
  const baristaId = c.req.param("baristaId");

  // お気に入り削除処理（実装予定）

  return c.json({ message: "Favorite removed successfully" });
});

// お気に入り一覧取得
favoriteRoutes.get("/", async (c) => {
  const payload = c.get("jwtPayload");
  const userId = payload.sub;

  // お気に入り一覧取得処理（実装予定）
  const favorites = [
    {
      id: "dummy-profile-id-1",
      displayName: "お気に入りバリスタ1",
      iconUrl: "https://example.com/icon1.jpg",
      shopName: "サンプルカフェ1",
    },
    {
      id: "dummy-profile-id-2",
      displayName: "お気に入りバリスタ2",
      iconUrl: "https://example.com/icon2.jpg",
      shopName: "サンプルカフェ2",
    },
  ];

  return c.json({ favorites });
});

export { favoriteRoutes };
