import { app, BrowserWindow, Menu, MenuItemConstructorOptions, ipcMain } from 'electron';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { autoUpdater } from 'electron-updater';

let mainWindow: BrowserWindow | null = null;
const isDev = !app.isPackaged;

ipcMain.on('card-bounds', (_event, bounds: Electron.Rectangle) => {
  if (mainWindow) {
    const current = mainWindow.getBounds();
    mainWindow.setBounds({ ...current, ...bounds });
  }
});

function createWindow() {
  const stateStoreFile = path.join(app.getPath('userData'), 'window-state.json');
  let state: Partial<Electron.Rectangle> = {};
  try {
    state = JSON.parse(fs.readFileSync(stateStoreFile, 'utf8'));
  } catch {
    state = {};
  }

  mainWindow = new BrowserWindow({
    width: state.width ?? 1024,
    height: state.height ?? 768,
    x: state.x,
    y: state.y,
    title: 'Focana',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  mainWindow.on('close', () => {
    if (!mainWindow) return;
    const bounds = mainWindow.getBounds();
    try {
      fs.writeFileSync(stateStoreFile, JSON.stringify(bounds));
    } catch {
      // ignore write errors
    }
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
    if (process.env.OPEN_DEVTOOLS === 'true') {
      mainWindow.webContents.openDevTools();
    }
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
