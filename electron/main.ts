import { app, BrowserWindow, Menu, MenuItemConstructorOptions } from 'electron';
import * as path from 'node:path';
import { autoUpdater } from 'electron-updater';

let mainWindow: BrowserWindow | null = null;
const isDev = !app.isPackaged;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 384,
    height: 336,
    minWidth: 384,
    minHeight: 336,
    maxWidth: 384,
    maxHeight: 336,
    resizable: false,
    title: 'Focana',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  const template: MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [{ role: 'quit' as const }],
    },
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    const indexHtml = path.join(__dirname, '../dist/index.html');
    mainWindow.loadFile(indexHtml);
    autoUpdater.checkForUpdatesAndNotify();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

autoUpdater.setFeedURL({ provider: 'generic', url: 'https://example.com/updates' });
autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
