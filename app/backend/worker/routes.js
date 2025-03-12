import { Hono } from "hono";
import { cors } from "hono/cors";
import { wasmMiddleware } from "./middleware/wasm.js";
import { getHello } from "./handlers/base.js";
import * as todoHandlers from "./handlers/todo.js";

/**
 * アプリケーションルートを作成します
 * @returns {Hono} Honoアプリケーションインスタンス
 */
export function createRoutes() {
  const app = new Hono();

  // CORSミドルウェア
  app.use(
    "*",
    cors({
      origin: "*",
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type"],
    }),
  );

  // WebAssembly初期化ミドルウェア
  app.use("*", wasmMiddleware);

  // 基本ルート
  app.get("/", getHello);
  app.get("/api/hello", getHello);

  // Todoルート
  app.get("/api/todos", todoHandlers.getAllTodos);
  app.post("/api/todos", todoHandlers.createTodo);
  app.get("/api/todos/:id", todoHandlers.getTodoById);
  app.put("/api/todos/:id", todoHandlers.updateTodo);
  app.delete("/api/todos/:id", todoHandlers.deleteTodo);

  return app;
}
