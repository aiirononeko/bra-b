import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { HTTPException } from "hono/http-exception";
import { drizzle } from "drizzle-orm/d1";

import { auth } from "../auth";
import { buildHono } from "./common";

import * as schema from "../db/schema";

import baristaRoutes from "./routes/barista-routes";
import authRoutes from "./routes/auth-routes";

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

// データベース接続のミドルウェア
app.use("*", async (c, next) => {
  c.set("db", drizzle(c.env.DB, { schema }));
  await next();
});

// ヘルスチェック
app.get("/health", (c) => c.json({ status: "ok" }));

// BetterAuthのルートを追加
app.on(["POST", "GET"], "/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

// APIルート
const routes = app
  .route("/auth", authRoutes)
  .route("/baristas", baristaRoutes)
  .onError((err, c) => {
    if (err instanceof HTTPException) {
      return err.getResponse();
    }
    console.error("Unhandled error:", err);
    return c.json({ error: "Internal Server Error" }, 500);
  });

export type AppType = typeof routes;
