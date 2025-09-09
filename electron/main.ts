import { app, BrowserWindow, Menu, MenuItemConstructorOptions } from 'electron';
import * as path from 'node:path';
import { autoUpdater } from 'electron-updater';

let mainWindow: BrowserWindow | null = null;
const isDev = !app.isPackaged;

/**
 * Creates and configures the main application BrowserWindow.
 *
 * Instantiates `mainWindow` (1200×800, title "Focana") with a preload script, installs a simple "File → Quit" application menu,
 * and wires up UI and lifecycle behavior:
 * - Sends a `window-resize` IPC message with the window bounds on resize.
 * - In development (`isDev`) loads `http://localhost:5173` and opens DevTools.
 * - In production loads the built `dist/index.html` and calls the auto-updater to check for updates and notify.
 * - Clears the `mainWindow` reference when the window is closed.
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
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

  mainWindow.on('resize', () => {
    const bounds = mainWindow?.getBounds();
    if (bounds) mainWindow?.webContents.send('window-resize', bounds);
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
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
