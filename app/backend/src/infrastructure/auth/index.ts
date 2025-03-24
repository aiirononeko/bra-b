import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
// import { oneTap } from "better-auth/plugins";
import type { PrismaClient } from "@prisma/client/edge";

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
const createBetterAuth = (
  prisma: PrismaClient,
  secret: string,
  googleClientId: string,
  googleClientSecret: string,
): ReturnType<typeof betterAuth> => {
  return betterAuth({
    secret,
    database: prismaAdapter(prisma, {
      provider: "sqlite",
    }),
    // // Google oauthを設定する
    // socialProviders: {
    //   google: {
    //     clientId: googleClientId,
    //     clientSecret: googleClientSecret,
    //   },
    // },
    // // Google one tapのプラグインをONにする
    // plugins: [oneTap()],
  });
};

/**
 * 環境に合わせた認証インスタンスを作成する関数
 *
 * 環境変数からシークレットを取得し、認証インスタンスを作成
 *
 * @param env - 環境変数を含むオブジェクト
 * @returns better-authのインスタンス、またはエラー時はnull
 */
export const createAuthWithEnv = (env: Env): ReturnType<typeof betterAuth> => {
  try {
    const secret = env.BETTER_AUTH_SECRET || "";
    if (!secret) {
      throw new Error("BETTER_AUTH_SECRET環境変数が設定されていません");
    }

    const googleClientId = env.GOOGLE_CLIENT_ID || "";
    const googleClientSecret = env.GOOGLE_CLIENT_SECRET || "";

    if (!googleClientId || !googleClientSecret) {
      throw new Error("GOOGLE_CLIENT_IDまたはGOOGLE_CLIENT_SECRET環境変数が設定されていません");
    }

    // Prismaクライアントを取得して認証インスタンスを作成
    const prismaClient = getPrismaClient(env);
    return createBetterAuth(prismaClient, secret, googleClientId, googleClientSecret);
  } catch (error) {
    console.error("認証初期化エラー:", error);
    throw error;
  }
};
