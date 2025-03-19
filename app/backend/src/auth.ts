import { betterAuth } from "better-auth";
import { drizzle } from "drizzle-orm/d1";
import { users } from "./db/schema";
import type { Env } from "./types";

export const createAuth = (env: Env) => {
  const db = drizzle(env.DB);

  return betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    // Drizzleアダプターの設定
    adapter: {
      type: "drizzle",
      tables: {
        users,
      },
      db,
    },
    // マジックリンク認証の設定
    magicLink: {
      enabled: true,
      from: "no-reply@example.com",
      subject: "ブラービにログイン",
    },
    // Googleログインの設定
    google: {
      enabled: true,
      // 本番環境では適切なclientIdとclientSecretを設定する
      clientId: "dummy-client-id",
      clientSecret: "dummy-client-secret",
    },
  });
};
