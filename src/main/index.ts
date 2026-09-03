import { join } from 'node:path';
import { app, BrowserWindow, ipcMain, nativeTheme } from 'electron';
import { IpcChannel } from '../shared/ipc.js';
import { JumpService } from './jump-service.js';

const jump = new JumpService();

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1180,
    height: 780,
    minWidth: 940,
    minHeight: 620,
    show: false,
    backgroundColor: '#1c1917',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: join(import.meta.dirname, '../preload/index.mjs'),
      sandbox: false,
      contextIsolation: true,
    },
  });

  win.on('ready-to-show', () => win.show());

  const rendererUrl = process.env['ELECTRON_RENDERER_URL'];
  if (rendererUrl) {
    void win.loadURL(rendererUrl);
  } else {
    void win.loadFile(join(import.meta.dirname, '../renderer/index.html'));
  }
}

function registerIpc(): void {
  ipcMain.handle(IpcChannel.JumpStatus, () => jump.status());
  ipcMain.handle(IpcChannel.JumpLogin, (_e, email: string, password: string) =>
    jump.login(email, password),
  );
  ipcMain.handle(IpcChannel.JumpLogout, () => jump.logout());
  ipcMain.handle(IpcChannel.JumpMoney, () => jump.money());
  ipcMain.handle(IpcChannel.AppVersion, () => app.getVersion());
}

app.whenReady().then(() => {
  nativeTheme.themeSource = 'dark';
  registerIpc();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
