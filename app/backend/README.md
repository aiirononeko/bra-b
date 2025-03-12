# bra-B バックエンド

bra-B（ブラービ）のバックエンドは、Golang で実装されたレイヤードアーキテクチャに基づいた API 基盤です。

## アプリケーションの概要

bra-B(ブラービ)は、バリスタがセルフブランディングしたり、カスタマーから客観的な評価を受けることができる Web サービスです。
バリスタは bra-B を通して、自身のプロフィールを全世界に発信できます。
カスタマーはバリスタのページからバリスタを評価することで、バリスタは自身の評価を確認できます。
カスタマーの評価にも工夫があり、bra-B 独自の評価システムによってよりプロフェッショナルを客観的に評価することができます。

## アーキテクチャ

バックエンドは、ドメイン駆動設計（DDD）の考え方を取り入れたレイヤードアーキテクチャで構築されています。レイヤードアーキテクチャは、関心事の分離と依存関係の方向性を明確にすることで、保守性の高いコードベースを実現します。

### ディレクトリ構造

```
app/backend/src/
├── domain/             # ドメイン層（ビジネスロジックとエンティティ）
│   ├── models/         # ドメインモデルとそのロジック
│   │   └── todo/       # Todoドメインモデル
│   │       └── entity/ # Todoエンティティの定義
│   └── repositories/   # リポジトリのインターフェース
├── externals/          # 外部サービスとの連携
│   └── repositories/   # リポジトリの実装
│       └── memory/     # インメモリ実装
├── presentations/      # プレゼンテーション層（API定義など）
├── queries/            # クエリ処理（データ取得）
├── shared/             # 共有モジュールやユーティリティ
├── workflows/          # ワークフロー（書き込み処理）
├── main.go             # エントリーポイント
└── main_wasm.go        # WebAssembly用エントリーポイント
```

### レイヤー構成

バックエンドは以下の主要なレイヤーで構成されています：

1. **ドメイン層** (`domain/`): ビジネスロジックとエンティティを含む中心的な層です。

   - `models/`: ドメインモデルとそのロジックを定義します。
   - `repositories/`: データアクセスのためのインターフェースを定義します。

2. **プレゼンテーション層** (`presentations/`): HTTP リクエストの処理を担当します。

3. **クエリ層** (`queries/`): データの読み取り処理を担当します。

4. **ワークフロー層** (`workflows/`): データの書き込み処理とビジネスフローを担当します。

5. **外部層** (`externals/`): データベースや API など外部サービスとの連携を実装します。

   - `repositories/memory/`: リポジトリのインメモリ実装。

6. **共有層** (`shared/`): エラー型や共通ユーティリティを提供します。

### 依存関係の方向

依存関係は常に外側から内側に向かいます：

```
presentations → workflows/queries → domain
                                     ↑
                     externals/repositories
```

## 利用可能なエンドポイント

現在、以下のエンドポイントが実装されています：

### 基本エンドポイント

- `GET /`: "Hello, World!"メッセージを返します
- `GET /api/hello`: "Hello, World!"メッセージを返します

### Todo API

- `GET /api/todos`: 全ての Todo を取得します
- `GET /api/todos/:id`: 指定された ID の Todo を取得します
- `POST /api/todos`: 新しい Todo を作成します
  - リクエスト例: `{ "title": "買い物", "description": "牛乳を買う" }`
- `PUT /api/todos/:id`: 既存の Todo を更新します
  - リクエスト例: `{ "title": "買い物", "description": "牛乳と卵を買う", "completed": true }`
- `DELETE /api/todos/:id`: 指定された ID の Todo を削除します

## WebAssembly 対応

バックエンドは WebAssembly (WASM) にも対応しており、ブラウザで直接実行できる関数を提供しています：

- `getHelloMessage()`: "Hello, World from WebAssembly!"メッセージを返します
- `getAllTodos()`: 全ての Todo を取得します
- `getTodoById(id)`: 指定された ID の Todo を取得します
- `createTodo(input)`: 新しい Todo を作成します
- `updateTodo(id, input)`: 既存の Todo を更新します
- `deleteTodo(id)`: 指定された ID の Todo を削除します

## 実行環境

### ローカル開発環境

1. Go のインストール (バージョン 1.24 以上)
2. 依存関係のインストール: `go mod download`
3. サーバーの起動: `go run src/main.go`

デフォルトでは、サーバーは `http://localhost:8080` で起動します。

### Cloudflare Workers

本アプリケーションは Cloudflare Workers 上でも動作します。

1. WebAssembly ビルド: `GOOS=js GOARCH=wasm go build -o wasm/main.wasm src/main_wasm.go`
2. wasm_exec.js のコピー: `cp "$(go env GOROOT)/misc/wasm/wasm_exec.js" wasm/`
3. ローカル開発サーバーの起動: `npx wrangler dev`
4. デプロイ: `npx wrangler publish`

Cloudflare Workers 上では、`worker.js` がエントリーポイントとなり、WebAssembly 関数を呼び出して API として提供します。

## ビルド方法

### 通常のバイナリビルド

```bash
go build -o server src/main.go
```

### WebAssembly ビルド

```bash
GOOS=js GOARCH=wasm go build -o wasm/main.wasm src/main_wasm.go
```

## エラー処理

エラー処理は各レイヤー専用のエラー型を使用して実装されています：

- `DomainError`: ドメイン層のエラー
- `ApplicationError`: ワークフロー層のエラー
- `QueryError`: クエリ層のエラー

これにより、エラーの発生源とコンテキストが明確になります。
