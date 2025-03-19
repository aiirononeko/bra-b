import { betterAuth } from "better-auth";
import { getPrismaClient } from "./infrastructure/prisma";
import type { Env } from "./types";

// better-authの初期化関数
function createBetterAuth(db: ReturnType<typeof getPrismaClient>) {
  return betterAuth({
    secret: "insecure-secret-change-in-production",
    database: {
      db,
      type: "prisma",
    },
    emailPassword: {
      enabled: true,
    },
    session: {
      freshAge: 60 * 5, // 5分
      expiresIn: 30 * 24 * 60 * 60, // 30日
      updateAge: 24 * 60 * 60, // 24時間
    },
    plugins: [],
  });
}

// デフォルト認証インスタンスは実際に使う時に初期化する
export const auth = {
  handler: () => new Response("Auth not initialized", { status: 500 }),
  api: {
    getSession: (options?: unknown) => Promise.resolve(null),
  },
};

// 環境に合わせた認証インスタンスを取得
export const createAuthWithEnv = (env: Env) => {
  try {
    const prismaClient = getPrismaClient(env);
    return createBetterAuth(prismaClient);
  } catch (error) {
    console.error("認証初期化エラー:", error);
    return auth;
  }
};
