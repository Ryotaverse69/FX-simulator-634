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
