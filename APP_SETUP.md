App Packaging Guide

Overview
- Mobile (iOS/Android): Capacitor wrapper (uses existing `index.html` as web assets)
- Desktop (Windows/macOS/Linux): Electron wrapper (loads local `index.html`)

Requirements
- Node.js 18+ and npm
- iOS: Xcode + Apple Developer account (for device/signing)
- Android: Android Studio + SDKs

Install dependencies
```sh
npm install
```

Mobile (Capacitor)
1) Initialize native platforms
```sh
# iOS
npm run cap:add:ios

# Android
npm run cap:add:android
```

2) Sync web assets to native projects
```sh
npm run cap:sync
```

3) Open projects in IDE
```sh
npm run app:ios      # opens Xcode
npm run app:android  # opens Android Studio
```

Notes
- `capacitor.config.json` sets `webDir` to `.` so native apps serve the existing files.
- Service worker is disabled inside Capacitor by runtime detection.
- App icons/splash: Use Capacitor Resources to generate platform icons from an SVG/PNG.
  - https://capacitorjs.com/docs/guides/splash-screens-and-icons

Desktop (Electron)
Run in development
```sh
npm run app:desktop
```

Package for distribution (optional)
- Add electron-builder or other packager; example dependencies:
```jsonc
// package.json additions (example)
// "devDependencies": { "electron-builder": "^24" }
// "scripts": { "build:desktop": "electron-builder" }
```
Then configure targets in `electron-builder` per OS.

Troubleshooting
- White screen in Electron or mobile: ensure `index.html` and assets are at the repo root and paths are relative (`./`).
- Service worker caching old files: reload twice after pushing or bump cache name in `service-worker.js`.
- iOS icons: create `icons/apple-touch-icon.png` (180x180). PWA uses `icons/icon-192.png` and `icons/icon-512.png`.

