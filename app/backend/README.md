# バックエンド API

このディレクトリには、Go で書かれたバックエンド API が含まれています。Cloudflare Workers 上で WebAssembly として実行するための設定も含まれています。

## プロジェクト構造

```
app/backend/
├── src/                # Go ソースコード
│   ├── main.go         # 通常の Go サーバー (ローカル開発用)
│   └── main_wasm.go    # WebAssembly ビルド用のエントリーポイント
├── wasm/               # コンパイル済み WebAssembly (ビルド後に生成)
│   ├── main.wasm       # コンパイル済み WebAssembly
│   └── wasm_exec.js    # WebAssembly実行用のJavaScriptグルー
├── worker.js           # Cloudflare Workers 用 JavaScript
├── build.sh            # ビルドスクリプト
├── go.mod              # Go モジュール定義
└── go.sum              # Go 依存関係のハッシュ
```

## 必要なツール

- Go 1.16 以上
- Node.js 18.0 以上 (Cloudflare Workers 開発用)
- wrangler (Cloudflare Workers CLI)

## セットアップ

### Go のセットアップ

```bash
# 依存関係をインストール
go mod tidy
```

### Node.js 依存関係のインストール

```bash
cd app/backend
npm install
```

### WebAssembly ビルド

WebAssembly にコンパイル:

```bash
./build.sh
```

このプロジェクトでは、初期設定では標準の Go コンパイラを使用して WebAssembly をビルドします。TinyGo をインストールしている場合は、`build.sh`を編集することで TinyGo を使用できます。

## Cloudflare Workers での実行

### ローカル開発

1. まず WebAssembly をビルド:

   ```bash
   ./build.sh
   ```

2. 開発サーバーを起動:

   ```bash
   npm run dev
   ```

3. ブラウザで `http://localhost:8787/api/hello` にアクセスして API 動作を確認

### デプロイ

```bash
npm run deploy      # 本番環境へデプロイ
npm run deploy:dev  # 開発環境へデプロイ
```

### ローカルでの認証とデプロイテスト

Wrangler を使ってローカルでデプロイするには、以下のいずれかの方法で認証情報を設定できます：

1. **環境変数を使用する方法**:

   ```bash
   export CLOUDFLARE_API_TOKEN=your_api_token
   export CLOUDFLARE_ACCOUNT_ID=your_account_id
   npm run deploy
   ```

2. **.env ファイルを使用する方法**:

   ```bash
   # .env ファイルを作成（.gitignoreに追加済み）
   echo "CLOUDFLARE_API_TOKEN=your_api_token" > .env
   echo "CLOUDFLARE_ACCOUNT_ID=your_account_id" >> .env
   npm run deploy
   ```

3. **Wrangler 設定ファイルに直接記述する方法** (本番環境では非推奨):
   ```toml
   # wrangler.toml に追加（プライベートリポジトリでのみ使用）
   account_id = "your_account_id"
   ```
   その後、`wrangler login`コマンドで認証します。

> **注意**: Wrangler 3.x では設定ファイル（wrangler.toml）の形式が変更されました。WebAssembly ファイルの指定は `[[rules]]` セクションで行われ、`fallthrough = true`設定が必要です。

## API エンドポイント

- `GET /` または `GET /api/hello` - Hello World メッセージを返す

### API テスト

```bash
# ローカル開発サーバーでテスト
curl http://localhost:8787/api/hello

# 本番環境でテスト
curl https://bra-b-backend.workers.dev/api/hello
# または
curl https://api.bra-b.com/hello
```

## 技術スタック

- [Go](https://golang.org/)
- [Echo](https://echo.labstack.com/) - HTTP サーバーフレームワーク
- [Cloudflare Workers](https://workers.cloudflare.com/) - サーバーレス実行環境
- [WebAssembly](https://webassembly.org/) - ブラウザやサーバーレス環境で実行できるバイナリフォーマット

## GitHub Actions によるデプロイ

このリポジトリは GitHub Actions を使用して、Cloudflare Workers に自動的にデプロイするように設定されています。main ブランチにプッシュすると、`app/backend`ディレクトリに変更があった場合に自動的にデプロイが実行されます。

### 必要な設定

GitHub リポジトリの「Settings」→「Secrets and variables」→「Actions」で以下のシークレットを設定する必要があります：

1. `CLOUDFLARE_API_TOKEN` - Cloudflare API トークン（**必要な権限: Account.Workers Scripts:Edit, Account.Workers Routes:Edit**）
2. `CLOUDFLARE_ACCOUNT_ID` - Cloudflare アカウント ID

### 開発環境のセットアップと初回デプロイ

GitHub Actions でデプロイする前に、以下の準備が必要です：

```bash
cd app/backend
npm install
git add wrangler.toml package.json
git commit -m "Add Cloudflare Worker configuration"
git push
```

### API トークンの作成方法

1. Cloudflare のダッシュボードにログイン
2. 右上のプロフィールアイコン →「My Profile」をクリック
3. 左メニューの「API Tokens」をクリック
4. 「Create Token」をクリック
5. 「Create Custom Token」を選択
   - **Token name**: 「Workers Deployment」など分かりやすい名前
   - **Permissions**:
     - Account > Account Settings > Read
     - Account > Worker Scripts > Edit
     - Account > Workers Routes > Edit
     - Zone > Zone Settings > Read (必要に応じて)
     - Zone > Zone > Read (必要に応じて)
   - **Account Resources**: 該当するアカウント
   - **Zone Resources**: 該当するゾーン（ドメインを使用する場合）
6. 「Continue to summary」→「Create Token」をクリック
7. 表示されたトークンをコピーして GitHub のシークレットとして設定
   - この画面を閉じると二度とトークンを表示できないので注意

### アカウント ID の確認方法

1. Cloudflare のダッシュボードにログイン
2. Workers & Pages にアクセス
3. 右下の「Account ID」の値をコピー

### 手動デプロイ

GitHub Actions の「Actions」タブから「Deploy Backend to Cloudflare Workers」ワークフローを選択し、「Run workflow」ボタンをクリックすることで、手動でデプロイを実行することもできます。
