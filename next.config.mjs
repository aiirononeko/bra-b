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
    // 環境変数が設定されている場合のみ除外
    if (process.env.IGNORE_SUPABASE_FUNCTIONS === "true") {
      config.externals = [...(config.externals || []), { "supabase/functions": "supabase/functions" }];
    }
    return config;
  },
  // ビルド時に特定のディレクトリを無視
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // supabase/functionsディレクトリを無視
  distDir: 'build',
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  compiler: {
    // supabase/functionsディレクトリを除外
    exclude: [/supabase\/functions/],
  },
};

export default withBundleAnalyzer(nextConfig);
