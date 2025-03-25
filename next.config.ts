import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["randomuser.me"], // 外部画像ドメインを許可
  },
};

export default nextConfig;
