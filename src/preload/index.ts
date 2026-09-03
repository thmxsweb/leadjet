import { contextBridge, ipcRenderer } from 'electron';
import { IpcChannel, type LeadjetApi } from '../shared/ipc.js';

const api: LeadjetApi = {
  jump: {
    status: () => ipcRenderer.invoke(IpcChannel.JumpStatus),
    login: (email, password) => ipcRenderer.invoke(IpcChannel.JumpLogin, email, password),
    logout: () => ipcRenderer.invoke(IpcChannel.JumpLogout),
    money: () => ipcRenderer.invoke(IpcChannel.JumpMoney),
  },
  leads: {
    search: (input) => ipcRenderer.invoke(IpcChannel.LeadsSearch, input),
    list: () => ipcRenderer.invoke(IpcChannel.LeadsList),
    save: (lead) => ipcRenderer.invoke(IpcChannel.LeadsSave, lead),
    updateStatus: (id, status) => ipcRenderer.invoke(IpcChannel.LeadsUpdateStatus, id, status),
    update: (id, patch) => ipcRenderer.invoke(IpcChannel.LeadsUpdate, id, patch),
    remove: (id) => ipcRenderer.invoke(IpcChannel.LeadsRemove, id),
    audit: (url) => ipcRenderer.invoke(IpcChannel.LeadsAudit, url),
  },
  app: {
    version: () => ipcRenderer.invoke(IpcChannel.AppVersion),
  },
};

contextBridge.exposeInMainWorld('leadjet', api);
