import { join } from 'node:path';
import { app, BrowserWindow, ipcMain, nativeTheme } from 'electron';
import { IpcChannel } from '../shared/ipc.js';
import type { Lead, LeadSearchInput, LeadStatus } from '../shared/lead.js';
import { JumpService } from './jump-service.js';
import { LeadService } from './leads/service.js';

const jump = new JumpService();
const leads = new LeadService();

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

  ipcMain.handle(IpcChannel.LeadsSearch, (_e, input: LeadSearchInput) => leads.search(input));
  ipcMain.handle(IpcChannel.LeadsList, () => leads.list());
  ipcMain.handle(IpcChannel.LeadsSave, (_e, lead: Lead) => leads.save(lead));
  ipcMain.handle(IpcChannel.LeadsUpdateStatus, (_e, id: string, status: LeadStatus) =>
    leads.updateStatus(id, status),
  );
  ipcMain.handle(IpcChannel.LeadsUpdate, (_e, id: string, patch: Partial<Lead>) =>
    leads.update(id, patch),
  );
  ipcMain.handle(IpcChannel.LeadsRemove, (_e, id: string) => leads.remove(id));
  ipcMain.handle(IpcChannel.LeadsAudit, (_e, url: string) => leads.audit(url));

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
