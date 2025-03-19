// import { buildHono } from "../common";
// import { auth } from "../../auth";

// /**
//  * 認証ルートの設定
//  * BetterAuthのハンドラーを全てのパスに対応させる
//  */
// const app = buildHono();

// // BetterAuthのハンドラーを全てのパスに対応させる
// app.all("/*", async (c) => {
//   try {
//     // BetterAuthのハンドラを呼び出す
//     const result = await auth.handler(c.req.raw);
//     return result;
//   } catch (error) {
//     console.error("Auth handler error:", error);
//     return c.json({ error: "Authentication error" }, 500);
//   }
// });

// // カスタム認証エンドポイントを追加する場合はここに記述
// // 例: パスワードリセット確認や追加の認証情報の取得など

// export default app;
