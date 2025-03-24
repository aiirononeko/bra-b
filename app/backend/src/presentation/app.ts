import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { HTTPException } from "hono/http-exception";

import { buildHono } from "./common";
import { prismaMiddleware } from "./middlewares/prisma";
import { authMiddleware } from "./middlewares/auth";

import authRoutes from "./routes/auth-routes";
import baristaRoutes from "./routes/barista-routes";

/**
 * アプリケーションのメインエントリーポイント
 *
 * Honoアプリケーションの設定、ミドルウェアの適用、ルートの定義を行う
 */
export const app = buildHono();

/**
 * ミドルウェアの設定
 */
// ロギングミドルウェア
app.use("*", logger());

// CORSミドルウェア
app.use(
  "*",
  cors({
    origin: ["http://localhost:5173", "https://bra-b.com"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// セキュリティヘッダーミドルウェア
app.use("*", secureHeaders());

// Prismaクライアントのミドルウェア
app.use("*", prismaMiddleware);

// BetterAuthインスタンスのミドルウェア
app.use("*", authMiddleware);

/**
 * ヘルスチェックエンドポイント
 *
 * GET /health
 * @returns アプリケーションのステータス情報
 */
app.get("/health", (c) =>
  c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  }),
);

/**
 * ユーザー情報とセッション情報を設定するミドルウェア
 */
app.use("*", async (c, next) => {
  const auth = c.get("auth");

  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  console.log(session);

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }

  c.set("user", session.user);
  c.set("session", session.session);
  return next();
});

/**
 * APIルートの設定
 */
export const routes = app
  .route("/auth", authRoutes)
  .route("/baristas", baristaRoutes)
  .onError((err, c) => {
    // HTTPExceptionの場合はそのレスポンスを返す
    if (err instanceof HTTPException) {
      return err.getResponse();
    }

    // 予期しないエラーの場合はログに出力し、一般的なエラーメッセージを返す
    console.error("Unhandled error:", err);
    return c.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "サーバー内部でエラーが発生しました",
      },
      500,
    );
  });

export type AppType = typeof routes;
