import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  onWindowResize: (callback: (event: Electron.IpcRendererEvent, bounds: Electron.Rectangle) => void) =>
    ipcRenderer.on('window-resize', callback),
  setCardBounds: (bounds: Electron.Rectangle) => ipcRenderer.send('card-bounds', bounds),
  versions: process.versions,
});
