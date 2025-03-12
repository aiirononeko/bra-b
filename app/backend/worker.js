/**
 * Cloudflare Workers エントリーポイント
 * Honoフレームワークを使用したAPI実装
 */
import { createRoutes } from "./worker/routes.js";

// Honoアプリケーションの作成
const app = createRoutes();

// Cloudflare Workersエクスポート
export default {
  fetch: app.fetch,
};
