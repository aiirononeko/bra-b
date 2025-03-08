import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [TanStackRouterVite({ target: "react", autoCodeSplitting: true }), react()],
  // Cloudflare Pages向けにビルド設定を最適化
  build: {
    // チャンクサイズを最適化
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["@tanstack/react-router"],
          query: ["@tanstack/react-query"],
        },
      },
    },
    // ソースマップを生成
    sourcemap: true,
    // ファイル名にハッシュを含める（キャッシュ対策）
    cssCodeSplit: true,
  },
});
