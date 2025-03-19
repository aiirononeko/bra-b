import { betterAuth } from "better-auth";

import { db } from "./db";
import type { Env } from "./types";

export const auth = betterAuth({
  secret: "insecure-secret-change-in-production",
  database: {
    db,
    type: "sqlite",
  },
  baseURL: process.env.BETTER_AUTH_URL,
  emailPassword: {
    enabled: true,
  },
  session: {
    freshAge: 60 * 5, // 5分
    expiresIn: 30 * 24 * 60 * 60, // 30日
    updateAge: 24 * 60 * 60, // 24時間
  },
  plugins: [
    // magicLink({
    // 	async sendMagicLink(data) {
    // 		console.log({
    // 			data,
    // 		});
    // 		await resend.emails.send({
    // 			from,
    // 			to: to || data.email,
    // 			subject: "Sign in to Better Auth",
    // 			html: `
    // 				<p>Click the link below to sign in to Better Auth:</p>
    // 				<a href="${data.url}">Sign in</a>
    // 			`,
    // 		});
    // 	},
    // }),
  ],
});

// 環境変数アクセス用のヘルパー（必要に応じて使用）
export const createAuthWithEnv = (env: Env) => {
  // 将来的にはDBを渡す予定
  return auth;
};
