import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";

// APIのベースパス
const API_BASE = "/api";

// 環境変数の型定義
type Bindings = {
  API_VERSION: string;
};

// アプリケーションの作成
const app = new Hono<{ Bindings: Bindings }>();

// ミドルウェアの適用
app.use("*", logger());
app.use("*", prettyJSON());
app.use(
  "*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// ルートエンドポイント
app.get("/", (c) => {
  return c.json({
    message: "Hono API Server is running",
    version: c.env.API_VERSION,
  });
});

// APIルーター
const api = new Hono();

// Hello エンドポイント
api.get("/hello", (c) => {
  const name = c.req.query("name") || "World";
  return c.json({
    message: `Hello, ${name}!`,
    timestamp: new Date().toISOString(),
  });
});

// ユーザー一覧エンドポイント（サンプル）
api.get("/users", (c) => {
  return c.json([
    { id: 1, name: "Alice", role: "admin" },
    { id: 2, name: "Bob", role: "user" },
    { id: 3, name: "Charlie", role: "user" },
  ]);
});

// ユーザー詳細エンドポイント（サンプル）
api.get("/users/:id", (c) => {
  const id = Number.parseInt(c.req.param("id"));

  // サンプルデータ
  const users = [
    { id: 1, name: "Alice", email: "alice@example.com", role: "admin" },
    { id: 2, name: "Bob", email: "bob@example.com", role: "user" },
    { id: 3, name: "Charlie", email: "charlie@example.com", role: "user" },
  ];

  const user = users.find((u) => u.id === id);

  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  return c.json(user);
});

// APIルーターをメインアプリにマウント
app.route(API_BASE, api);

// エラーハンドリング
app.onError((err, c) => {
  console.error(`${err}`);
  return c.json(
    {
      error: "Internal Server Error",
      message: err.message,
    },
    500,
  );
});

// 404ハンドリング
app.notFound((c) => {
  return c.json(
    {
      error: "Not Found",
      message: `${c.req.url} is not found`,
    },
    404,
  );
});

// Workersでエクスポート
export default app;
