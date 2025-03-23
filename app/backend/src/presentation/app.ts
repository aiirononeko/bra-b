import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { HTTPException } from "hono/http-exception";

import { auth, createAuthWithEnv } from "../auth";
import { buildHono } from "./common";
import { prismaMiddleware } from "./middlewares/prisma";
import type { BetterAuthInstance } from "./common";

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
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// セキュリティヘッダーミドルウェア
app.use("*", secureHeaders());

// Prismaクライアントのミドルウェア
app.use("*", prismaMiddleware);

// authインスタンスを環境に応じて初期化するミドルウェア
app.use("*", async (c, next) => {
  c.set("auth", createAuthWithEnv(c.env) as unknown as BetterAuthInstance);
  await next();
});

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
 * 認証ルートの設定
 *
 * BetterAuthライブラリによる認証エンドポイント
 */
app.on(["POST", "GET"], "/auth/*", (c) => {
  const authInstance = c.get("auth") || auth;
  return authInstance.handler(c.req.raw);
});

/**
 * APIルートの設定
 */
export const routes = app.route("/baristas", baristaRoutes).onError((err, c) => {
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
