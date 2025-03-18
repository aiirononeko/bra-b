import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { jwt } from "hono/jwt";

const tipRoutes = new Hono();

// 認証ミドルウェア
tipRoutes.use(
  "/*",
  jwt({
    secret: process.env.JWT_SECRET || "fallback-secret",
  }),
);

// チップ送信のスキーマ
const sendTipSchema = z.object({
  baristaId: z.string().uuid(),
  amount: z.number().positive(),
  message: z.string().optional(),
});

// チップ送信
tipRoutes.post("/", zValidator("json", sendTipSchema), async (c) => {
  const payload = c.get("jwtPayload");
  const userId = payload.sub;
  const { baristaId, amount, message } = c.req.valid("json");

  // Stripe決済処理（実装予定）

  return c.json(
    {
      paymentIntentId: "dummy-payment-intent-id",
      message: "Tip payment initiated successfully",
    },
    201,
  );
});

export { tipRoutes };
