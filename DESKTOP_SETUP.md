アゲアゲFX — デスクトップアプリ（Electron）

前提
- Node.js 18+ / npm

開発実行（デバッグ）
- npm install
- npm run desktop:icons  （初回のみ／アイコンPNGを生成）
- npm run app:desktop    （Electronウィンドウで起動）

パッケージング（配布物の作成）
- ディレクトリ出力: npm run desktop:pack
- インストーラ/アプリ: npm run desktop:dist
- 出力物は OS ごとに dist/ に作成

自動アップデート（macOS）
- 仕組み: electron-updater + GitHub Releases を使用
- 事前準備:
  1) GitHubにReleasesを作成できるトークンを発行（scopes: repo）
  2) ターミナルで `export GH_TOKEN=...`（mac）
  3) package.json の build.publish は GitHub（owner/repo）に設定済み
- リリース作成（アップロード含む）:
  - `npx electron-builder -p always` もしくは `npm run desktop:dist` 実行時に GH_TOKEN があれば自動でReleaseにアップロード
- 注意（macの自動更新）:
  - 署名/公証（notarization）が必要です。Apple Developer アカウントでの署名証明書と公証設定を行ってください。
  - 未署名アプリは自動更新や配布でGatekeeperに止められます。

開発中の挙動
- アプリ起動時とメニュー「アップデートを確認」でGitHubの更新確認を行います
- 更新が見つかると自動ダウンロード→終了時にインストール、またはダイアログで「再起動して更新」選択可能

設定（package.json の build）
- appId: com.ryotaverse.ageagefx
- productName: アゲアゲFX
- files: index.html / styles.css / script.js / brokers.json / icons/** / manifest.webmanifest / desktop/electron/**
- icons: build/icon.png（1024x1024）から自動変換
- mac: dmg/zip（Finance カテゴリ）
- win: nsis/zip
- linux: AppImage/tar.gz

備考
- アプリ内では Service Worker を無効化済み（安定性向上）
- 価格APIは公開HTTPS APIを使用
- アイコンは icons/icon.svg または resources/icon.svg を元に desktop:icons で生成
