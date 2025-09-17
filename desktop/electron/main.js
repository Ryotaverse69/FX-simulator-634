const { app, BrowserWindow, dialog, Menu } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
let mainWindow;

function createWindow() {
  const iconCandidates = [
    path.join(__dirname, '../../build/icon.png'),
    path.join(__dirname, '../../icons/icon-512.png'),
  ];
  const iconPath = iconCandidates.find(p => {
    try { return require('fs').existsSync(p); } catch { return false; }
  });

  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: '#ffffff',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    autoHideMenuBar: true,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    title: 'アゲアゲFX'
  });

  const entry = path.join(__dirname, '../../index.html');
  win.loadFile(entry).catch(err => {
    // Fallback: try from app path root
    const alt = path.join(app.getAppPath(), 'index.html');
    win.loadFile(alt).catch(() => {
      win.webContents.executeJavaScript(`document.body.innerHTML = '<pre style="padding:24px">Failed to load UI. Tried:\n${entry}\n${alt}\n${err}</pre>'`);
    });
  });
  mainWindow = win;
}

function buildMenu() {
  const template = [
    ...(process.platform === 'darwin' ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { label: 'アップデートを確認', click: () => checkForUpdates(true) },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    { label: '表示', submenu: [{ role: 'reload' }, { role: 'forcereload' }, { type: 'separator' }, { role: 'toggledevtools' }, { type: 'separator' }, { role: 'resetzoom' }, { role: 'zoomin' }, { role: 'zoomout' }, { role: 'togglefullscreen' }] },
    { label: 'ウィンドウ', submenu: [{ role: 'minimize' }, { role: 'close' }] }
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function initAutoUpdater() {
  try {
    const log = require('electron-log');
    autoUpdater.logger = log;
    autoUpdater.logger.transports.file.level = 'info';
  } catch (_) {}
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('update-available', () => {
    if (!mainWindow) return;
    mainWindow.webContents.send('update-status', { status: 'available' });
  });
  autoUpdater.on('update-not-available', () => {
    if (!mainWindow) return;
    mainWindow.webContents.send('update-status', { status: 'none' });
  });
  autoUpdater.on('error', (err) => {
    if (!mainWindow) return;
    mainWindow.webContents.send('update-status', { status: 'error', message: String(err) });
  });
  autoUpdater.on('download-progress', (p) => {
    if (!mainWindow) return;
    mainWindow.webContents.send('update-status', { status: 'downloading', progress: p.percent });
  });
  autoUpdater.on('update-downloaded', () => {
    if (!mainWindow) return;
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      buttons: ['再起動して更新', '後で'],
      defaultId: 0,
      cancelId: 1,
      title: 'アップデート準備完了',
      message: '新しいバージョンがダウンロードされました。今すぐインストールしますか？'
    }).then(({ response }) => {
      if (response === 0) autoUpdater.quitAndInstall();
    });
  });
}

function checkForUpdates(manual = false) {
  try {
    autoUpdater.checkForUpdatesAndNotify();
    if (manual && mainWindow) {
      dialog.showMessageBox(mainWindow, { type: 'info', message: 'アップデートを確認しています…', buttons: ['OK'] });
    }
  } catch (e) {
    if (manual && mainWindow) dialog.showMessageBox(mainWindow, { type: 'error', message: 'アップデートの確認に失敗しました。', detail: String(e) });
  }
}

app.whenReady().then(() => {
  createWindow();
  buildMenu();
  initAutoUpdater();
  checkForUpdates(false);
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
