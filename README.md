# プロジェクト概要

このリポジトリは Google Apps Script を TypeScript/JavaScript で開発するための雛形です。`clasp` を使ってスクリプトの管理・デプロイを行います。

# 前提条件

- Node.js（推奨: v14 以上）
- pnpm, bun, npm または yarn
- Google アカウント
- clasp（Google Apps Script CLI）
  ```bash
  npm install -g @google/clasp
  ```

# 初期セットアップ

1. このリポジトリをクローン／ダウンロード
   ```bash
   git clone <repository_url>
   cd <repository_dir>
   ```

2. 依存パッケージをインストール
   ```bash
   npm install
   ```

3. clasp にログイン
   ```bash
   clasp login --no-localhost
   ```
   ブラウザで認証を行い、成功するとターミナルに「Logged in」表示が出ます。

4. プロジェクトを作成／クローン
   - 既存プロジェクトをクローンする場合
     ```bash
     clasp clone --rootDir './src' <SCRIPT_ID>
     ```
   - 新規プロジェクトを作成する場合
     ```bash
     clasp create --rootDir './src' --title "<プロジェクト名>"
     ```
   実行後、プロジェクト直下に `.clasp.json` が生成されます。

5. `.clasp.json` の `rootDir` を `./src` に変更
   ```json
   {
     "scriptId": "<YOUR_SCRIPT_ID>",
     "rootDir": "./src"
   }
   ```

6. ソースディレクトリ構成
   ```
   .
   ├─ .clasp.json
   ├─ package.json
   ├─ tsconfig.json
   └─ src/
       ├─ index.ts
       └─ ...
   ```

# 開発フロー

- コード編集：`src/` 配下に TypeScript/JavaScript ファイルを作成・編集
- ビルド（TypeScript を使う場合）
  ```bash
  npm run build
  ```
- スクリプトをデプロイ
  ```bash
  clasp push
  ```
- リモート変更を取得
  ```bash
  clasp pull
  ```

# よく使うコマンド

- `npm install`
- `npm run build`
- `clasp login`
- `clasp push`
- `clasp pull`

---

以上で初期セットアップは完了です。開発をお楽しみください！
