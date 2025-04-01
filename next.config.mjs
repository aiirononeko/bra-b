import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

// Bundle analyzer plugin
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimized server actions (実験的機能として配置)
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
    ],
  },
  // Supabase functionsをビルド対象から除外
  webpack: (config) => {
    // supabase/functionsディレクトリを除外
    config.externals = [...(config.externals || []), { "supabase/functions": "supabase/functions" }];
    
    // supabase/functionsディレクトリをwebpack経由で除外
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /\.tsx?$/,
      exclude: /supabase\/functions/,
    });
    
    return config;
  },
  // TypeScriptのビルドエラーを許容
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default withBundleAnalyzer(nextConfig);
