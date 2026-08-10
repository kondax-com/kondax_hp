# Yardora 本番環境構築 — 調査報告と手順書

作成日: 2026-08-10

## 1. 概要

Yardora の本番環境(PROD)構築に向けた事前調査の結果と、構築手順をまとめたドキュメントです。

## 2. 調査結果

### 2.1 本リポジトリ(kondax_hp)の調査

- 本リポジトリは KONDAX コーポレートサイト(Next.js 15 + Sanity CMS + Resend + GA4)であり、Yardora のコード・設定は含まれていない
- 全ファイル・全 Git 履歴・全ブランチを検索したが、Yardora への言及なし
- Yardora のコードベースは別リポジトリに存在すると推定される

### 2.2 外部サービスの調査状況

Vercel / Supabase / Sanity の各プロジェクト一覧の確認は、ツール承認待ちのため未完了。
STG 環境の実際の設定値(環境変数・ドメイン・データセット構成など)は未確認であり、
本書の手順は組織の標準スタック(Vercel + Supabase + Sanity + Resend)を前提としたテンプレートである。

## 3. 前提スタック(想定)

| レイヤー | サービス | STG | PROD |
| --- | --- | --- | --- |
| ホスティング | Vercel | 確認中 | 新規設定 |
| データベース / 認証 | Supabase | 確認中 | 新規プロジェクト |
| CMS | Sanity | 確認中 | 本番 dataset |
| メール送信 | Resend | 確認中 | 本番ドメイン認証 |

## 4. 本番構築手順

### 4.1 Supabase

1. 本番用プロジェクトを新規作成(リージョンは STG と同一を推奨)
2. STG のマイグレーションを本番プロジェクトへ適用
3. RLS ポリシー・Edge Functions・拡張機能を STG と同期
4. 本番用 API キー(publishable key / secret key)を取得
5. `get_advisors` 等でセキュリティ・パフォーマンス警告がないことを確認

### 4.2 Sanity

1. 本番用 dataset(例: `production`)を作成
2. スキーマを本番 dataset へデプロイ
3. CORS 設定に本番ドメインを追加
4. 必要に応じて STG からコンテンツをエクスポート / インポート
5. Studio のワークスペース設定に本番 dataset を追加

### 4.3 Vercel

1. 本番プロジェクト(または既存プロジェクトの Production 環境)を用意
2. Production 環境変数を設定
   - Supabase URL / API キー
   - Sanity Project ID / dataset / API バージョン
   - Resend API キー
   - `NEXT_PUBLIC_BASE_URL`(本番ドメイン)
   - アナリティクス ID
3. 本番ドメインを接続し、SSL 証明書の発行を確認
4. `main` ブランチを Production デプロイに紐付け
5. Deployment Protection(必要なら)を設定

### 4.4 周辺サービス

1. Resend: 本番送信ドメインの認証(SPF / DKIM / DMARC)
2. アナリティクス: 本番用プロパティの作成・計測 ID の差し替え
3. sitemap / robots.txt の本番 URL 反映

### 4.5 リリース

1. STG で最終動作確認(フォーム送信・CMS 反映・認証フロー等)
2. 本番デプロイ実行
3. 本番での動作確認(主要導線・メール送信・データ書き込み)
4. 監視 / アラート(Vercel Runtime Logs、Supabase Logs)の確認体制を用意

## 5. 未確定事項(要確認)

- [ ] Yardora リポジトリの正確な `owner/repo` 名
- [ ] STG の Vercel プロジェクト名と環境変数一覧
- [ ] STG の Supabase プロジェクト ID とマイグレーション状況
- [ ] Sanity プロジェクト ID / dataset 構成(Yardora 用)
- [ ] 本番ドメイン名と DNS 管理者
- [ ] リリース予定日とロールバック方針

上記が確定次第、本書の手順を実際の設定値(プロジェクト ID・環境変数名・ドメイン)で具体化する。
