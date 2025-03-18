import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { jwt } from "hono/jwt";
import type { MiddlewareHandler } from "hono";

const evaluationRoutes = new Hono();

// 評価カテゴリ・タグ一覧取得
evaluationRoutes.get("/categories", async (c) => {
  // カテゴリ・タグ一覧取得処理（実装予定）
  const categories = [
    {
      id: "cat-1",
      name: "接客",
      tags: [
        { id: "tag-1", name: "笑顔が素敵" },
        { id: "tag-2", name: "気遣いがある" },
        { id: "tag-3", name: "丁寧な接客" },
      ],
    },
    {
      id: "cat-2",
      name: "ドリンク品質",
      tags: [
        { id: "tag-4", name: "ラテアートが美しい" },
        { id: "tag-5", name: "味が素晴らしい" },
        { id: "tag-6", name: "温度が適切" },
      ],
    },
  ];

  const commonTags = [
    { id: "common-1", name: "またお願いしたい" },
    { id: "common-2", name: "プロフェッショナル" },
    { id: "common-3", name: "親しみやすい" },
  ];

  return c.json({ categories, commonTags });
});

// バリスタ評価のスキーマ
const evaluateBaristaSchema = z.object({
  baristaId: z.string().uuid(),
  selectedTagIds: z.array(z.string()),
});

// 認証ミドルウェア（オプショナル）
const optionalAuth: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (authHeader?.startsWith("Bearer ")) {
    try {
      const jwt = await import("hono/jwt");
      const secret = process.env.JWT_SECRET || "fallback-secret";
      const handler = jwt.jwt({ secret });
      await handler(c, next);
    } catch (e) {
      // 認証失敗時は匿名ユーザーとして処理を続行
      await next();
    }
  } else {
    // 認証ヘッダーがない場合は匿名ユーザーとして処理を続行
    await next();
  }
};

// バリスタ評価
evaluationRoutes.post("/", optionalAuth, zValidator("json", evaluateBaristaSchema), async (c) => {
  const { baristaId, selectedTagIds } = c.req.valid("json");

  // JWTペイロードがある場合（認証済みユーザー）
  let evaluatorId = null;
  try {
    const payload = c.get("jwtPayload");
    if (payload?.sub) {
      evaluatorId = payload.sub;
    }
  } catch (e) {
    // 認証されていない場合は匿名評価
  }

  // 評価登録処理（実装予定）

  return c.json({ message: "Evaluation submitted successfully" }, 201);
});

export { evaluationRoutes };
