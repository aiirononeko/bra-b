import { PrismaClient } from "@prisma/client/edge";
import { PrismaD1 } from "@prisma/adapter-d1";

import type { Env } from "../types";

// 単純なPrismaクライアントのインスタンスは作成せず、常にアダプターを使用する
// このダミー変数はローカル開発時のみ使用
let prisma: PrismaClient | null = null;

// ローカル開発環境かどうかを判断
const isLocalDevelopment = typeof self === "undefined";

/**
 * Prismaクライアントを取得または初期化する
 * Cloudflare D1データベースが利用可能な場合はそれを使用し、それ以外の場合はダミーまたはダイレクトモードを使用
 */
export function getPrismaClient(env?: Env): PrismaClient {
  // Cloudflare Workers環境でD1データベースが利用可能
  if (env?.DB) {
    try {
      const adapter = new PrismaD1(env.DB);
      // @ts-ignore - adapter属性はプレビュー機能で使用可能だがTypeScriptの型定義に含まれていない
      return new PrismaClient({ adapter });
    } catch (error) {
      console.error("Prisma D1アダプターの初期化に失敗しました:", error);
      // エラーを投げるのではなくフォールバックする
    }
  }

  // ローカル開発環境の場合のみ、標準のPrismaクライアントを初期化
  if (isLocalDevelopment) {
    if (!prisma) {
      console.log("ローカル開発用のPrismaクライアントを初期化します");
      prisma = new PrismaClient();
    }
    return prisma;
  }

  // それ以外の場合はエラーを投げる
  throw new Error(
    "Prismaクライアントを初期化できません。環境変数とデータベース接続を確認してください。",
  );
}

// 互換性のために残しておく
// アプリケーションコードでこの変数が直接使われている場所があれば、getPrismaClient()に置き換える必要がある
export default {
  $connect: () => Promise.resolve(),
  $disconnect: () => Promise.resolve(),
  profile: {
    findMany: () => Promise.resolve([]),
    findFirst: () => Promise.resolve(null),
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
  },
  evaluation: {
    count: () => Promise.resolve(0),
  },
} as unknown as PrismaClient;
