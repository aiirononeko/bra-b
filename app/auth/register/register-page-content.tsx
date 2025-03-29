"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { getAnonymousIdFromClient } from "@/app/utils/anonymous-auth/client";
import { BaristaRegisterForm } from "./barista-register-form";
import { CustomerRegisterForm } from "./customer-register-form";

enum RegisterType {
  Customer = "customer",
  Barista = "barista",
}

// URLパラメータを取得するためのラッパーコンポーネント
// Suspenseのエラーを回避するため
function RegisterTypeSelector({
  onTypeChange,
}: {
  onTypeChange: (type: RegisterType) => void;
}) {
  const searchParams = useSearchParams();
  const type = (searchParams.get("type") as RegisterType) || RegisterType.Customer;

  // マウント時に一度だけ実行
  useEffect(() => {
    onTypeChange(type);
  }, [type, onTypeChange]);

  return null;
}

// メインのコンテンツコンポーネント
export function RegisterPageContent() {
  const [registerType, setRegisterType] = useState<RegisterType>(RegisterType.Customer);
  const [anonymousId, setAnonymousId] = useState<string | undefined>(undefined);

  // コンポーネントマウント時に匿名IDを取得
  useEffect(() => {
    const fetchAnonymousId = async () => {
      const id = getAnonymousIdFromClient();
      if (id) {
        console.log("匿名ID取得:", id);
        setAnonymousId(id);
      }
    };

    fetchAnonymousId();
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      {/* Suspense境界でuseSearchParamsを使用するコンポーネントをラップ */}
      <Suspense fallback={null}>
        <RegisterTypeSelector onTypeChange={setRegisterType} />
      </Suspense>

      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">bra-B (ブラービ)</h1>
          <p className="text-gray-600 dark:text-gray-400">バリスタの価値を可視化するサービス</p>
        </div>

        <div className="mb-8">
          <div className="flex justify-center mb-6">
            <fieldset className="inline-flex rounded-md shadow-sm">
              <legend className="sr-only">登録タイプ</legend>
              <button
                type="button"
                onClick={() => setRegisterType(RegisterType.Customer)}
                className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                  registerType === RegisterType.Customer
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                カスタマー登録
              </button>
              <button
                type="button"
                onClick={() => setRegisterType(RegisterType.Barista)}
                className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                  registerType === RegisterType.Barista
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                バリスタ登録
              </button>
            </fieldset>
          </div>
        </div>

        {/* 匿名IDをフォームに渡す */}
        {registerType === RegisterType.Customer ? (
          <CustomerRegisterForm anonymousId={anonymousId} />
        ) : (
          <BaristaRegisterForm anonymousId={anonymousId} />
        )}

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
          >
            ← トップページに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
