import { app, BrowserWindow, Menu, MenuItemConstructorOptions, ipcMain, screen } from 'electron';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { autoUpdater } from 'electron-updater';

let mainWindow: BrowserWindow | null = null;
const isDev = !app.isPackaged;
// Enable card mode only when explicitly requested
const isCardMode = process.env.CARD_MODE === 'true';

ipcMain.on('card-bounds', (_event, bounds: Electron.Rectangle) => {
  if (mainWindow && isCardMode) {
    const current = mainWindow.getBounds();
    mainWindow.setBounds({ ...current, ...bounds });
  }
});

function createWindow() {
  const stateStoreFile = path.join(app.getPath('userData'), 'window-state.json');
  const MIN_WIDTH = 400;
  const MIN_HEIGHT = 300;
  let state: Partial<Electron.Rectangle> = {};

  // Only restore previous window bounds when not in card mode
  if (!isCardMode) {
    try {
      state = JSON.parse(fs.readFileSync(stateStoreFile, 'utf8'));
      if (
        typeof state.width === 'number' &&
        typeof state.height === 'number' &&
        (state.width < MIN_WIDTH || state.height < MIN_HEIGHT)
      ) {
        state = {};
        try {
          fs.unlinkSync(stateStoreFile);
        } catch {
          // ignore remove errors
        }
      }
    } catch {
      state = {};
    }
  }

  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
  const defaultWidth = isCardMode ? 384 : screenWidth;
  const defaultHeight = isCardMode ? 480 : screenHeight;

  mainWindow = new BrowserWindow({
    width: state.width ?? defaultWidth,
    height: state.height ?? defaultHeight,
    resizable: !isCardMode,
    x: state.x,
    y: state.y,
    title: 'Focana',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  if (!isCardMode && !state.width && !state.height) {
    mainWindow.maximize();
  }

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
