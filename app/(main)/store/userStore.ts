'use client';

import { create } from 'zustand';
import { User } from '@/app/types';

interface UserStore {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateBalance: (balance: number) => void;
  logout: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  isLoading: true,
  error: null,

  setUser: (user) => set({ user, error: null }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  updateBalance: (balance) =>
    set((state) => ({
      user: state.user ? { ...state.user, balance } : null,
    })),

  logout: () => set({ user: null, error: null }),
}));
