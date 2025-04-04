import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import HeaderContainer from "./components/layout/header-container";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    template: "%s | ブラービ",
    default: "ブラービ",
  },
  description: "ブラービは、バリスタ起点でコーヒーを飲みにいくような体験を提供するサービスです。",
  applicationName: "bra-B",
  authors: [{ name: "bra-B Team" }],
  keywords: ["バリスタ", "コーヒー", "カフェ", "評価"],
  creator: "bra-B Team",
  publisher: "bra-B",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    siteName: "bra-B",
    title: "bra-B",
    description: "bra-Bは、バリスタ起点でコーヒーを飲みにいくような体験を提供するサービスです。",
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    title: "bra-B",
    description: "bra-Bは、バリスタ起点でコーヒーを飲みにいくような体験を提供するサービスです。",
    card: "summary_large_image",
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

export default async function RootLayout({
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
