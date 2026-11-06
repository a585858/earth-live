# Earth Live

日本周辺の地震観測情報を3D地球儀で可視化する日本語Webアプリです。React + TypeScript (strict) + Vite + Tailwind CSS + Three.js / React Three Fiber / dreiで実装しています。バックエンド・APIキーは不要です。

## 起動方法

Node.js 22.12以降（Node.js 22 LTS推奨）とnpmを用意してください。

```bash
npm install
npm run dev
```

ターミナルに表示されるURL（通常 http://localhost:5173 ）を開きます。ブラウザのWebGLと外部サービスへの接続が必要です。

```bash
npm test
npm run build
npm run preview
```

- `npm test`: 座標変換、範囲の境界、APIスキーマ、不明な規模、危険なリンクの除外、期間・地域の絞り込みを検証
- `npm run build`: TypeScriptのstrict型チェック後、`dist/`に本番用ファイルを出力
- `npm run preview`: 本番ビルドをローカルで確認

## 使い方

- 地球儀をドラッグして回転、ホイール・ピンチまたは＋／−でズーム。
- 照準ボタンで日本周辺の初期位置に戻ります。
- 地球儀のマーカーまたは地震一覧を選ぶと、震源名、発生日時（日本時間）、深さ、マグニチュード、緯度・経度を表示します。
- マグニチュードフィルターは一覧とマーカーの両方に適用されます。「すべて」は規模不明も含みます。
- 更新ボタンで再取得します。自動更新ではありません。取得中は更新ボタンを無効化します。
- エラー時は再試行できます。更新に失敗して前回データが残る場合は「前回取得分」と表示し、最終取得時刻を保持します。
- WebGL非対応時も地震一覧から詳細を閲覧できます。

## データと表示の定義

出典: [USGS GeoJSON Summary Feed](https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php)

`https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson`

USGSの直近7日間の全世界フィードから次の条件を満たす地震だけを表示します。

- 種別が `earthquake`
- 北緯20〜50度、東経120〜155度（境界を含む「日本周辺」の矩形範囲）
- 取得時点から7日前以降、取得時点以前の発生日時

GeoJSONの座標順は経度・緯度・深さです。Zodで応答全体を検証し、不正な形式の応答をエラーとして扱います。場所・規模のnull値は不明として扱います。マーカーは震央の地表位置であり、深さを視覚的な高度としては表していません。表示される時刻はすべてAsia/Tokyoです。端末時計の正確さが期間判定に影響します。

**架空の地震やサンプルデータを実データとして表示しません。** テスト内のデータはアプリに読み込まれません。USGSには小規模な日本の地震など未収録の事象があります。0件は「地震が発生していない」という意味ではありません。USGSの観測値は後から修正されることがあります。

**マグニチュードは地震の規模であり、日本の震度ではありません。本サービスは緊急地震速報・公式防災警報ではなく、防災判断を提供しません。** 避難などの判断には[気象庁](https://www.jma.go.jp/)・自治体などの公式情報を利用してください。

地球儀の海岸線は[Natural Earth](https://www.naturalearthdata.com/about/terms-of-use/)（public domain）の1:110m陸地データを使用します。v5.1.2をjsDelivrから実行時に読み込みます。地図は概観用で、国境や詳細な地形を表すものではありません。取得に失敗した場合は通知を表示し、地球儀・緯経線・地震一覧は利用できます。再読み込みで再試行できます。外部フォントや画像テクスチャへの依存はありません。

## ディレクトリ

```text
src/
  App.tsx                    画面構成・取得状態・選択・フィルター
  components/Globe.tsx       地球儀・地理描画・カメラ操作
  components/EarthquakeList.tsx
  components/EventDetails.tsx
  lib/earthquakes.ts          USGS取得・検証・日時表示
  lib/geo.ts                  球面座標変換・日本周辺の範囲
  lib/*.test.ts               座標・APIデータ検証テスト
  styles.css                 Tailwind読み込み・レスポンシブUI
public/_headers              Cloudflare Pages用レスポンスヘッダー
```

Three.js関連は遅延読み込みし、スマートフォンでは描画解像度を制限しています。

## Cloudflare Pagesへのデプロイ

### Git連携（推奨）

1. このディレクトリをGitHubまたはGitLabのリポジトリにpushします。
2. Cloudflareダッシュボードで **Workers & Pages → Create application → Pages → Import an existing Git repository** を選択します。画面の文言は更新されることがあります。
3. リポジトリを選び、次のビルド設定を指定します。

| 項目 | 値 |
| --- | --- |
| フレームワーク | Vite |
| ビルドコマンド | `npm run build` |
| 出力ディレクトリ | `dist` |
| ルートディレクトリ | このpackage.jsonがあるディレクトリ |
| 環境変数 | `NODE_VERSION=22` |

4. 保存してデプロイすると、Cloudflare PagesのURLが発行されます。
5. 公開URLでUSGSデータの取得、マーカー選択、スマートフォン表示を確認してください。

公開前に `npm install` で生成される `package-lock.json` をコミットすると依存解決を固定できます。APIの秘密鍵・サーバー側環境変数は不要です。

### ビルド済みファイルのDirect Upload

`npm install && npm test && npm run build` を実行し、Cloudflare Pagesの **Direct Upload** から `dist/` をアップロードします。Git連携とDirect Uploadは別のプロジェクト作成方式です。

公式手順: [Git連携](https://developers.cloudflare.com/pages/get-started/git-integration/) / [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/) / [ビルド設定](https://developers.cloudflare.com/pages/configuration/build-configuration/)

## この環境での検証

座標変換・API検証の6テストが、このワークスペースの親ディレクトリに既存のVitest 2.1.9 / Zod 4.6.7を用いて成功しました。プロジェクトで指定した依存バージョンでの再検証は未実施です。

この実行環境では外部ホストのDNS解決が失敗し、Three.js・React Three Fiber・drei・Tailwind Viteプラグインをインストールできませんでした。そのため本番ビルドは未取得依存によるエラーで停止しており、ビルド成功・実ブラウザでの表示・USGS実通信は未確認です。ネットワーク接続可能な環境で上記のインストール・テスト・ビルドを実施してください。
