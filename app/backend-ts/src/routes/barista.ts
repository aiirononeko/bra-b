import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { jwt } from "hono/jwt";

const baristaRoutes = new Hono();

// 認証ミドルウェア
baristaRoutes.use(
  "/*",
  jwt({
    secret: process.env.JWT_SECRET || "fallback-secret",
  }),
);

// バリスタプロフィールのスキーマ
const baristaProfileSchema = z.object({
  displayName: z.string().min(1).max(100),
  iconUrl: z.string().url().optional(),
  bio: z.string().optional(),
  snsLinks: z.array(z.string().url()).optional(),
  shopName: z.string().max(100).optional(),
});

// バリスタプロフィール作成
baristaRoutes.post("/", zValidator("json", baristaProfileSchema), async (c) => {
  const payload = c.get("jwtPayload");
  const userId = payload.sub;
  const profileData = c.req.valid("json");

  // プロフィール作成処理（実装予定）

  return c.json({ id: "dummy-profile-id", ...profileData }, 201);
});

// バリスタプロフィール更新
baristaRoutes.put("/:baristaId", zValidator("json", baristaProfileSchema), async (c) => {
  const baristaId = c.req.param("baristaId");
  const profileData = c.req.valid("json");

  // プロフィール更新処理（実装予定）

  return c.json({ id: baristaId, ...profileData });
});

// バリスタプロフィール取得
baristaRoutes.get("/:baristaId", async (c) => {
  const baristaId = c.req.param("baristaId");

  // プロフィール取得処理（実装予定）
  const profile = {
    id: baristaId,
    displayName: "サンプルバリスタ",
    iconUrl: "https://example.com/icon.jpg",
    bio: "コーヒー好きのバリスタです",
    shopName: "サンプルカフェ",
  };

  return c.json(profile);
});

// バリスタ評価一覧取得
baristaRoutes.get("/:baristaId/evaluations", async (c) => {
  const baristaId = c.req.param("baristaId");

  // 評価一覧取得処理（実装予定）
  const evaluations = [
    {
      id: "dummy-eval-id-1",
      evaluatorId: "anonymous",
      tags: ["笑顔が素敵", "ラテアートが美しい"],
      evaluatedAt: new Date().toISOString(),
    },
  ];

  return c.json({ evaluations });
});

// バリスタチップ一覧取得
baristaRoutes.get("/:baristaId/tips", async (c) => {
  const baristaId = c.req.param("baristaId");

  // チップ一覧取得処理（実装予定）
  const tips = [
    {
      id: "dummy-tip-id-1",
      senderId: "dummy-user-id",
      amount: 500,
      message: "いつもありがとう！",
      sentAt: new Date().toISOString(),
    },
  ];

  return c.json({ tips });
});

export { baristaRoutes };
