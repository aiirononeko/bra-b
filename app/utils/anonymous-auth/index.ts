/**
 * 匿名認証機能
 * クライアントサイドとサーバーサイドのインターフェースを統一
 */

// クライアントサイド用の機能をエクスポート
export {
  getAnonymousIdFromClient,
  syncAnonymousUser,
  migrateAnonymousData,
  setAnonymousIdCookie as setAnonymousIdCookieClient,
} from "./client";

// サーバーサイド用の機能は直接インポートして使用する必要がある
// import { getAnonymousIdFromCookie } from "@/app/utils/anonymous-auth/server";
