const { app, BrowserWindow } = require('electron');
const path = require('path');

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
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
