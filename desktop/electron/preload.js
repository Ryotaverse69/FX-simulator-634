// Expose minimal, safe APIs if needed later
// Currently we only listen for update status messages
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  onUpdateStatus: (fn) => {
    try { ipcRenderer.on('update-status', (_, data) => fn?.(data)); } catch (_) {}
  }
});
