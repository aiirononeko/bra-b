import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { HTTPException } from "hono/http-exception";

import { auth, createAuthWithEnv } from "../auth";
import { buildHono } from "./common";
import { prismaMiddleware } from "./middlewares/prisma";
import type { BetterAuthInstance } from "./common";

import baristaRoutes from "./routes/barista-routes";
// import authRoutes from "./routes/auth-routes";

export const app = buildHono();

// Middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: ["http://localhost:5173", "https://bra-b.com"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);
app.use("*", secureHeaders());

// Prismaクライアントのミドルウェア
app.use("*", prismaMiddleware);

// authインスタンスを環境に応じて初期化するミドルウェア
app.use("*", async (c, next) => {
  c.set("auth", createAuthWithEnv(c.env) as unknown as BetterAuthInstance);
  await next();
});

// ヘルスチェック
app.get("/health", (c) => c.json({ status: "ok" }));

// BetterAuthのルートを追加
app.on(["POST", "GET"], "/auth/*", (c) => {
  const authInstance = c.get("auth") || auth;
  return authInstance.handler(c.req.raw);
});

// APIルート
export const routes = app
  // .route("/auth", authRoutes)
  .route("/baristas", baristaRoutes)
  .onError((err, c) => {
    if (err instanceof HTTPException) {
      return err.getResponse();
    }
    console.error("Unhandled error:", err);
    return c.json({ error: "Internal Server Error" }, 500);
  });

export type AppType = typeof routes;
