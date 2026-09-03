import { create } from 'zustand';

export type View = 'radar' | 'pipeline' | 'contacts' | 'outreach' | 'money';

interface UiState {
  view: View;
  setView: (view: View) => void;
}

export const useUi = create<UiState>((set) => ({
  view: 'radar',
  setView: (view) => set({ view }),
}));
