# フロントエンドアプリケーション (React)

## 概要

バリスタファン構築サービスのフロントエンドアプリケーションです。React を使用した SPA として実装され、バックエンド API と型を安全に共有しています。

## 技術スタック

- **言語**: TypeScript
- **フレームワーク**: React
- **ビルドツール**: Vite
- **状態管理**: TanStack Query (React Query)
- **ルーティング**: TanStack Router
- **API クライアント**: Hono/fetch
- **デプロイ**: Cloudflare Pages

## 特徴

### 型安全な API 通信

バックエンドと型定義を共有し、完全に型安全な通信を実現しています。

```typescript
// バックエンドから型をインポート
import type { BaristaApi } from "../../../backend/src/api-types";

// 型安全なAPIクライアント
export const getBaristas = async (): Promise<
  ApiSuccessResponse<BaristasData>
> => {
  const response = await fetch(`${API_BASE_URL}/api/baristas`);
  // ...
};
```

### データフェッチの抽象化

TanStack Query を使用してデータフェッチを抽象化し、キャッシュや再取得の管理を自動化しています。

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ["baristas"],
  queryFn: async () => {
    const response = await getBaristas();
    return response.data;
  },
});
```

### コンポーネント設計

コンポーネントは以下の階層で設計されています：

1. **ページコンポーネント** - ルーティング対象の全画面コンポーネント
2. **UI コンポーネント** - 再利用可能な UI パーツ
3. **フック** - ロジックの抽象化

## ディレクトリ構造

```
src/
├── assets/               # 静的アセット（画像など）
├── components/           # 再利用可能なUIコンポーネント
├── hooks/                # カスタムフック
├── lib/                  # ユーティリティ関数
│   └── api.ts            # API通信ラッパー
├── pages/                # ページコンポーネント
├── routes/               # ルート定義
├── styles/               # グローバルスタイル
├── main.tsx              # エントリーポイント
└── App.tsx               # ルートコンポーネント
```

## 開発方法

```bash
# 依存関係のインストール
pnpm install

# 開発サーバーの起動
pnpm dev

# ビルド
pnpm build

# プレビュー（ビルド後）
pnpm preview

# デプロイ
pnpm deploy
```

## API 型の共有方法

バックエンドとフロントエンドの型共有は以下の方法で実現しています：

1. バックエンドが`api-types.ts`で API の型定義を提供
2. フロントエンドがこの型定義をインポート
3. API 通信関数は正確な型情報を持ったレスポンスを返却
4. TanStack Query による型安全なデータフェッチ

## 環境変数

以下の環境変数を`.env`ファイルで設定できます：

```
VITE_API_URL=http://localhost:8787  # バックエンドAPIのベースURL
```
