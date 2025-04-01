"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type HeaderProps = {
  isLoggedIn: boolean;
  isAdmin: boolean;
  userName?: string;
};

export default function Header({ isLoggedIn, isAdmin }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // アクティブなリンクのスタイル
  const getLinkStyle = (path: string) => {
    const isActive = pathname === path;
    return isActive
      ? "text-blue-600 dark:text-blue-400 font-medium"
      : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400";
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* ロゴ */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
              ☕️ bra-B
            </Link>
          </div>

          {/* PC向けナビゲーション */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className={getLinkStyle("/")}>
              ホーム
            </Link>

            {isLoggedIn ? (
              <>
                <Link href="/account" className={getLinkStyle("/account")}>
                  マイページ
                </Link>
                {isAdmin && (
                  <Link href="/admin/dashboard" className={getLinkStyle("/admin/dashboard")}>
                    管理者ダッシュボード
                  </Link>
                )}
                <Link
                  href="/signout"
                  className="bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1.5 rounded-md text-sm"
                >
                  ログアウト
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className={getLinkStyle("/login")}>
                  ログイン
                </Link>
                <Link
                  href="/signup"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm transition-colors"
                >
                  登録
                </Link>
              </>
            )}
          </nav>

          {/* モバイル向けメニューボタン */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-600 dark:text-gray-300 focus:outline-none"
            aria-label="メニューを開く"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-6 h-6"
              aria-hidden="true"
              role="img"
            >
              <title>メニューアイコン</title>
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              )}
            </svg>
          </button>
        </div>

        {/* モバイル向けドロップダウンメニュー */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <nav className="flex flex-col space-y-3">
              <Link
                href="/"
                className={`${getLinkStyle("/")} py-2`}
                onClick={() => setIsMenuOpen(false)}
              >
                ホーム
              </Link>

              {isLoggedIn ? (
                <>
                  <Link
                    href="/account"
                    className={`${getLinkStyle("/account")} py-2`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    マイページ
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin/dashboard"
                      className={`${getLinkStyle("/admin/dashboard")} py-2`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      管理者ダッシュボード
                    </Link>
                  )}
                  <Link
                    href="/signout"
                    className="text-red-600 dark:text-red-400 py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    ログアウト
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={`${getLinkStyle("/login")} py-2`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    ログイン
                  </Link>
                  <Link
                    href="/signup"
                    className="text-blue-600 dark:text-blue-400 font-medium py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    登録
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
