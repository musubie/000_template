# GAS プロジェクトテンプレート

Google Apps Script (GAS) を `clasp` + TypeScript 型チェックで開発するための雛形リポジトリ。

## 前提条件

| ツール | バージョン | 用途 |
|--------|-----------|------|
| Node.js | v18+ | ランタイム |
| pnpm | latest | パッケージ管理 |
| clasp | latest | GAS CLI (`npm i -g @google/clasp`) |
| Perl | 5.x (macOS 標準) | import/export トグル |

## セットアップ

### 新規プロジェクトの場合

```bash
# 1. テンプレートからリポジトリを作成
git clone <template_url> <project_name>
cd <project_name>

# 2. 依存パッケージをインストール
pnpm install

# 3. clasp にログイン（初回のみ）
clasp login

# 4. Apps Script プロジェクトを作成
make init
# → .clasp.json が生成される

# 5. Makefile の ID を設定
# PROD_ID, DEV_ID に Apps Script のスクリプト ID を記入
```

### 既存プロジェクトをクローンする場合

```bash
# 1. リポジトリをクローン
git clone <repository_url>
cd <project_name>

# 2. 依存パッケージをインストール
pnpm install

# 3. Makefile の PROD_ID を確認し、Apps Script をクローン
make clone
# → src/ に既存コードがダウンロードされる

# 4. import/export を復元
make deps
```

## 開発フロー

### コマンド一覧

| コマンド | 説明 |
|---------|------|
| `make help` | コマンド一覧を表示 |
| `make version` | 現在の環境（DEV/PROD）を表示 |
| `make dev` | DEV 環境に切り替え |
| `make prod` | PROD 環境に切り替え |
| `make lint` | biome lint を実行 |
| `make fmt` | biome format を実行 |
| `make deps` | import/export をアクティブに（開発用） |
| `make prep` | import/export をコメントアウト（デプロイ用） |
| `make push` | prep → clasp push → deps（デプロイ） |
| `make pull` | clasp pull → deps（リモート変更取得） |
| `make test` | ローカルテストを実行 |
| `pnpm t` | TypeScript 型チェック（tsc） |

### 編集 → デプロイ手順

```
1. コードを編集（src/ 配下）
2. make lint          # リント
3. pnpm t             # 型チェック
4. make push          # デプロイ（DEV 環境で確認後、make prod → make push）
```

## import/export の規約

GAS は ES Modules をサポートしないため、デプロイ前に `import`/`export` 文をコメントアウトする必要がある。この切り替えを `blkc.pl`（コメント化）と `blkuc.pl`（復元）で自動化している。

### 動作の仕組み

- **`make prep`** → `blkc.pl` が `import`/`export` 文を `/* ... */` でラップ
- **`make deps`** → `blkuc.pl` が `/* ... */` を除去して復元
- **`make push`** → prep → clasp push → deps を一括実行

### export の書き方（重要）

`blkc.pl` / `blkuc.pl` が正しく動作するには、**末尾で別行の export 宣言**を使う必要がある：

```javascript
// OK: 末尾の export 宣言（blkc.pl が正しくコメント化できる）
function myFunction() { ... }
const MY_CONST = 123;

export { myFunction, MY_CONST };

// NG: インライン export（blkc.pl が正しく処理できない）
export function myFunction() { ... }
export const MY_CONST = 123;
```

## ローカルテスト

[gas-fakes](https://github.com/brucemcpherson/gas-fakes) を使うと、GAS のグローバルオブジェクト（`SpreadsheetApp` 等）をローカル環境でエミュレートできる。

### セットアップ

```bash
# 1. 依存パッケージを追加
pnpm add -D @mcpher/gas-fakes dotenv

# 2. 初期化・認証
gas-fakes init        # .env ファイルを生成
gas-fakes auth        # Google 認証
gas-fakes enableAPIs  # 必要な API を有効化
```

### テストの書き方

`test/run.js` にテストコードを記述：

```javascript
import "@mcpher/gas-fakes";

// src/ のモジュールをインポート（.js 拡張子が必要）
import { myFunction } from "../src/myModule.js";

// テスト実行
const result = myFunction();
Logger.log(result);
```

### 実行

```bash
make test
# または
pnpm test
```

> `[Worker Error] Failed in sxDrive` はドライブ API の非致命的な警告。Sheets API は正常に動作する。

## ディレクトリ構成

```
.
├── src/                 # ソースコード（clasp の rootDir）
│   └── appsscript.json  # GAS マニフェスト
├── test/                # ローカルテスト（gas-fakes）
│   └── run.js           # テストランナー
├── prompts/             # AI エージェント用プロンプト
├── blkc.pl              # import/export コメント化スクリプト
├── blkuc.pl             # import/export 復元スクリプト
├── globals.d.ts         # グローバル型定義
├── package.json         # プロジェクト設定
├── tsconfig.json        # TypeScript 設定
├── biome.json           # Linter/Formatter 設定
├── Makefile             # ビルドコマンド
├── CLAUDE.md            # Claude Code ガイダンス
├── AGENTS.md            # AI エージェント用ガイドライン
└── CHANGELOG.md         # 変更履歴
```
