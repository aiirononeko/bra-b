import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import HeaderContainer from "./components/layout/header-container";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ブラービ",
  description: "ブラービは、バリスタ起点でコーヒーを飲みにいくような体験を提供するサービスです。",
  applicationName: "bra-B",
  authors: [{ name: "bra-B Team" }],
  keywords: ["バリスタ", "コーヒー", "評価", "チップ", "ファン"],
  creator: "bra-B Team",
  publisher: "bra-B",
  robots: {
    index: true,
    follow: true,
  },
};

// viewportとテーマの設定は個別のexportとして分離（Next.js 15.2.4+）
export const viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#111827" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <HeaderContainer />
        <main className="min-h-[calc(100vh-64px)]">{children}</main>
        <Analytics />
      </body>
    </html>
  );
}
