import type { LeadjetApi } from '../shared/ipc.js';

declare global {
  interface Window {
    leadjet: LeadjetApi;
  }
}

export {};
