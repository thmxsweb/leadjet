import { contextBridge, ipcRenderer } from 'electron';
import { IpcChannel, type LeadjetApi } from '../shared/ipc.js';

const api: LeadjetApi = {
  jump: {
    status: () => ipcRenderer.invoke(IpcChannel.JumpStatus),
    login: (email, password) => ipcRenderer.invoke(IpcChannel.JumpLogin, email, password),
    logout: () => ipcRenderer.invoke(IpcChannel.JumpLogout),
    money: () => ipcRenderer.invoke(IpcChannel.JumpMoney),
  },
  app: {
    version: () => ipcRenderer.invoke(IpcChannel.AppVersion),
  },
};

contextBridge.exposeInMainWorld('leadjet', api);
