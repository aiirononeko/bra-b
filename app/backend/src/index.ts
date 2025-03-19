import { Hono } from "hono";
import { cors } from "hono/cors";
import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";

import { createAuth } from "./auth";
import type { Env } from "./types";
import * as schema from "./db/schema";
import { baristaRoutes } from "./presentation/routes/barista-routes";

type Variables = {
  db: DrizzleD1Database<typeof schema>;
  auth: ReturnType<typeof createAuth>;
};

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// CORSの設定
app.use("*", cors());

// ミドルウェアを定義
app.use("*", async (c, next) => {
  // DB接続の初期化
  c.set("db", drizzle(c.env.DB, { schema }));

  // 認証の初期化
  c.set("auth", createAuth(c.env));

  await next();
});

app.route("/", baristaRoutes);

// 認証APIのルート（BetterAuthの公式ドキュメントに従う必要あり）
app.get("/auth/session", async (c) => {
  const auth = c.get("auth");
  // BetterAuthの公式方法で実装
  return c.json({ message: "認証APIは実装が必要です" });
});

// ユーザー情報取得エンドポイント
app.get("/user/me", async (c) => {
  // 認証チェックロジック（BetterAuthに合わせて修正必要）
  return c.json({ message: "未実装" });
});

// 評価カテゴリー取得エンドポイント
app.get("/evaluation/categories", async (c) => {
  return c.json({
    categories: [
      {
        id: "cat1",
        name: "接客",
        tags: [
          { id: "tag1", name: "笑顔が素敵" },
          { id: "tag2", name: "気遣いがある" },
        ],
      },
      {
        id: "cat2",
        name: "ドリンク品質",
        tags: [
          { id: "tag3", name: "ラテアートが美しい" },
          { id: "tag4", name: "味が素晴らしい" },
        ],
      },
    ],
    commonTags: [
      { id: "common1", name: "またお願いしたい" },
      { id: "common2", name: "プロフェッショナル" },
    ],
  });
});

export default app;

export type AppType = typeof app;
