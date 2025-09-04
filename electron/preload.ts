import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  onWindowResize: (callback: (event: Electron.IpcRendererEvent, bounds: Electron.Rectangle) => void) =>
    ipcRenderer.on('window-resize', callback),
  versions: process.versions,
});
