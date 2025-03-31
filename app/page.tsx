import BaristaCard from "@/app/components/barista-card";
import { fetchBaristaProfiles } from "@/app/repositories/profiles-repository";
import type { BaristaProfile } from "@/app/repositories/profiles-repository";
import Link from "next/link";

export default async function Home({
  searchParams,
}: {
  searchParams: { auth_success?: string; message?: string };
}) {
  const { data: baristaProfiles, error } = await fetchBaristaProfiles();

  // auth_successパラメータの確認
  const authSuccess = searchParams.auth_success === "true";
  const message = searchParams.message;

  return (
    <div className="min-h-screen">
      {authSuccess && message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}

      <header className="py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">☕️ bra-B (ブラービ)</h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            バリスタ個人がファンを獲得し、客観的評価とチップを受け取れるサービスです。
            あなたのお気に入りのバリスタを見つけてみましょう。
          </p>
        </div>
      </header>

      <main>
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">注目のバリスタ</h2>
          {error ? (
            <div className="bg-red-100 text-red-800 p-4 rounded">
              バリスタ情報の取得に失敗しました。しばらくしてからお試しください。
            </div>
          ) : !baristaProfiles || baristaProfiles.length === 0 ? (
            <div className="bg-yellow-100 text-yellow-800 p-4 rounded">
              現在、表示できるバリスタがいません。
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {baristaProfiles.map((profile: BaristaProfile) => (
                <BaristaCard key={profile.id} profile={profile} />
              ))}
            </div>
          )}
        </section>

        <section className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-6 md:mb-0">
              <h2 className="text-2xl font-bold mb-4">バリスタとして登録しませんか？</h2>
              <p className="mb-4 text-gray-600 dark:text-gray-300">
                あなたのバリスタとしての価値を可視化し、ファンを作りましょう。
                評価とチップを通して、あなたのスキルや個性が正当に評価されます。
              </p>
              <Link href="/auth/register">
                <button
                  type="button"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full transition-colors"
                >
                  バリスタ登録はこちら
                </button>
              </Link>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-[400px] h-[300px] bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-12 h-12 mx-auto mb-2"
                    aria-labelledby="baristaIconTitle"
                  >
                    <title id="baristaIconTitle">バリスタアイコン</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                    />
                  </svg>
                  <p>バリスタイメージ</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
