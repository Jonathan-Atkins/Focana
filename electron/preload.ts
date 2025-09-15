import { contextBridge, ipcRenderer } from 'electron';

const isCardMode = process.env.CARD_MODE === 'true';

contextBridge.exposeInMainWorld('electronAPI', {
  onWindowResize: (callback: (event: Electron.IpcRendererEvent, bounds: Electron.Rectangle) => void) =>
    ipcRenderer.on('window-resize', callback),
  ...(isCardMode
    ? {
        setCardBounds: (bounds: Electron.Rectangle) => ipcRenderer.send('card-bounds', bounds),
      }
    : {}),
  windowAction: (action: string) => ipcRenderer.invoke('window-action', action),
  versions: process.versions,
});
