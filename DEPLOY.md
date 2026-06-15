# Railway デプロイ手順

この jira_clone を [Railway](https://railway.app) にデプロイするための手順です。
**3 つのサービス**（Postgres / API / クライアント）を 1 つの Railway プロジェクト内に作成します。

```
┌─ Postgres  : postgres:11 の Docker イメージ（※ v11 必須）
├─ API       : api/Dockerfile.production（Node14 + ts-node、起動時にスキーマ自動生成）
└─ Client    : client/Dockerfile.production（本番ビルド → server.js で静的配信）
```

---

## ⚠️ 重要な前提（先に読んでください）

1. **Postgres は必ず v11。** TypeORM 0.2 は PostgreSQL 12 以降で `column "consrc" does not exist` エラーになります。Railway のマネージド Postgres は最新版なので使えません。**`postgres:11` の Docker イメージをサービスとして立てます。**
2. **クライアントは「ビルド時」に API URL と Google Client ID を埋め込みます。** そのため **API を先にデプロイして公開 URL を確定 → その URL でクライアントをビルド**、という順序になります。
3. **Google OAuth の生成元設定が必要。** デプロイ後、クライアントの公開 URL を Google Cloud Console の「承認済み JavaScript 生成元」に追加します（これはアプリ側では設定できません）。
4. **API に `NODE_ENV=production` を設定しないでください。** ts-node / typescript は devDependencies のため、devDeps がインストールされる必要があります（Dockerfile 側で `npm install --production=false` 済み）。

---

## 1. Railway プロジェクトを作成

- Railway で **New Project** → 空のプロジェクトを作成。
- GitHub リポジトリを連携（推奨）。CLI を使う場合は `npm i -g @railway/cli && railway login`。

## 2. Postgres (v11) サービス

- **New → Deploy a Docker Image** → イメージ名 `postgres:11`
- Variables:
  | 変数 | 値 |
  | --- | --- |
  | `POSTGRES_USER` | `postgres` |
  | `POSTGRES_PASSWORD` | （任意の強いパスワード） |
  | `POSTGRES_DB` | `jira_development` |
- デプロイ後、**Variables / Settings に表示される内部ホスト名**（例 `postgres.railway.internal`）を控えます。
- （任意）永続化のため Volume を `/var/lib/postgresql/data` にマウント。

## 3. API サービス

- **New → GitHub Repo** → このリポジトリを選択。
- **Settings → Root Directory = `api`**（モノレポのため）。
  - `api/railway.json` により `Dockerfile.production` が自動で使われます。
- **Variables**（実行時）:
  | 変数 | 値 |
  | --- | --- |
  | `DB_HOST` | `postgres.railway.internal`（手順 2 の内部ホスト） |
  | `DB_PORT` | `5432` |
  | `DB_USERNAME` | `postgres` |
  | `DB_PASSWORD` | （手順 2 と同じ） |
  | `DB_DATABASE` | `jira_development` |
  | `JWT_SECRET` | （安全なランダム文字列。例 `openssl rand -hex 32`） |
  | `GOOGLE_CLIENT_ID` | `xxxxx.apps.googleusercontent.com` |
  | `SEED_GUEST_DATA` | `false` |
  - `TS_NODE_TRANSPILE_ONLY` は Dockerfile.production で設定済み（個別設定は不要）。
  - `PORT` は Railway が自動注入します（アプリは `process.env.PORT` 対応済み）。
  - **`NODE_ENV` は設定しないでください**（前提 4 参照）。
- **Settings → Networking → Generate Domain** で公開 URL を発行し、控えます。
  例: `https://jira-api-production.up.railway.app`

> デプロイ時、TypeORM の `synchronize: true` により全テーブルが自動生成されます（マイグレーション不要）。

## 4. クライアントサービス

- **New → GitHub Repo** → 同じリポジトリを選択。
- **Settings → Root Directory = `client`**（`client/railway.json` で `Dockerfile.production` を使用）。
- **Variables（ビルド時に埋め込まれます）**:
  | 変数 | 値 |
  | --- | --- |
  | `API_URL` | 手順 3 で発行した API の公開 URL（末尾スラッシュなし） |
  | `GOOGLE_CLIENT_ID` | `xxxxx.apps.googleusercontent.com`（API と同じ） |
- **Generate Domain** でクライアント公開 URL を発行します。
  例: `https://jira-client-production.up.railway.app`

> `API_URL` / `GOOGLE_CLIENT_ID` を変更したら、バンドルに焼き込むため **再デプロイ（再ビルド）** が必要です。

## 5. Google OAuth の生成元を追加

- [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → 対象の OAuth 2.0 クライアント ID を開く。
- **承認済みの JavaScript 生成元** に手順 4 のクライアント URL を追加（例 `https://jira-client-production.up.railway.app`）。
- 保存後、反映まで数分かかる場合があります。

## 6. 初回利用（ブートストラップ）

- クライアント URL にアクセス → **Google でログイン**。
- **最初にログインしたユーザーが自動的に管理者（admin）** になります。
- ログイン後 `/spaces` でスペースを作成 → 作成者がそのスペースの管理者になります。
- スペース内でボードを作成 → 課題を作成して利用開始。

---

## トラブルシューティング

| 症状 | 原因 / 対処 |
| --- | --- |
| API ログに `column "consrc" does not exist` | Postgres が 12 以降。**postgres:11** を使う（手順 2）。 |
| API が起動直後に落ちる / `ts-node: not found` | devDeps が入っていない。`NODE_ENV=production` を**外す**。Dockerfile.production は `--production=false` 済み。 |
| ログイン画面で Google ボタンが出ない / `origin_mismatch` | 手順 5 の生成元未登録、またはクライアントを `GOOGLE_CLIENT_ID` 設定後に再ビルドしていない。 |
| ログインできるがデータが見えない / API 401・CORS | クライアントの `API_URL` が誤り。正しい API 公開 URL で**再ビルド**。 |
| 課題は出るが画像/添付が大きいと失敗 | 添付は base64 で 10MB 上限（API の JSON body 上限 20MB）。 |
| 既存 DB を移行した場合にスペース管理者が居ない | `INSERT INTO space_admins_user ("spaceId","userId") VALUES (<id>,<userId>);` で管理者を 1 人付与。 |

## CLI でのデプロイ（任意）

```bash
npm i -g @railway/cli
railway login
railway link            # 既存プロジェクトに紐付け
# API（api ディレクトリで）
cd api && railway up
# Client（client ディレクトリで）
cd ../client && railway up
```
各サービスの Root Directory / 変数はダッシュボードで設定しておきます。

---

## ローカル開発との違い

ローカルは `docker-compose.yml`（`api/Dockerfile`・`client/Dockerfile`、webpack-dev-server / nodemon、ソースのバインドマウント）を使います。
本番は `*.Dockerfile.production`（ビルド済み静的配信 / ts-node、バインドマウントなし）を使います。両者は併存します。
