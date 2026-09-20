import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../services/api';

type AppState = {
  token: string | null;
  user: User | null;
  setSession: (token: string, user: User | null) => void;
  clearSession: () => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: (token, user) => set({ token, user }),
      clearSession: () => set({ token: null, user: null }),
    }),
    { name: 'idiomas-pro-session' },
  ),
);
