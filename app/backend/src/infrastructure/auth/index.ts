import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { getPrismaClient } from "../prisma/client";
import type { Env } from "../../types";

/**
 * better-authの初期化関数
 *
 * PrismaクライアントとBETTER_AUTH_SECRETを使用して認証インスタンスを作成する
 *
 * @param prisma - Prismaクライアントのインスタンス
 * @param secret - 認証トークンの暗号化に使用する秘密鍵
 * @returns better-authのインスタンス
 */
function createBetterAuth(prisma: ReturnType<typeof getPrismaClient>, secret: string) {
  return betterAuth({
    secret,
    database: prismaAdapter(prisma, {
      provider: "sqlite",
    }),
  });
}

/**
 * デフォルト認証インスタンス
 * 実際の認証処理は初期化後に置き換えられる
 */
export const auth = {
  handler: () => new Response("認証システムが初期化されていません", { status: 500 }),
};

/**
 * 環境に合わせた認証インスタンスを作成する関数
 *
 * 環境変数からシークレットを取得し、認証インスタンスを作成
 *
 * @param env - 環境変数を含むオブジェクト
 * @returns better-authのインスタンス、またはエラー時はデフォルトインスタンス
 */
export const createAuthWithEnv = (env: Env) => {
  try {
    // 環境変数からシークレットを取得
    const secret = env.BETTER_AUTH_SECRET || "";
    // シークレットが設定されていない場合はエラー
    if (!secret) {
      throw new Error("BETTER_AUTH_SECRET環境変数が設定されていません");
    }

    // Prismaクライアントを取得して認証インスタンスを作成
    const prismaClient = getPrismaClient(env);
    return createBetterAuth(prismaClient, secret);
  } catch (error) {
    console.error("認証初期化エラー:", error);
    return auth;
  }
};
