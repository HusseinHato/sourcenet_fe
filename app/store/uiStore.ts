'use client';

import { create } from 'zustand';
import { MarketplaceFilters } from '@/app/types';

interface UIStore {
  isModalOpen: boolean;
  modalType: string | null;
  modalData: any;
  filters: MarketplaceFilters;
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  notifications: Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>;

  openModal: (type: string, data?: any) => void;
  closeModal: () => void;
  setFilters: (filters: MarketplaceFilters) => void;
  resetFilters: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;
  addNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  removeNotification: (id: string) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isModalOpen: false,
  modalType: null,
  modalData: null,
  filters: {},
  theme: 'light',
  sidebarOpen: true,
  notifications: [],

  openModal: (type, data) =>
    set({
      isModalOpen: true,
      modalType: type,
      modalData: data,
    }),

  closeModal: () =>
    set({
      isModalOpen: false,
      modalType: null,
      modalData: null,
    }),

  setFilters: (filters) => set({ filters }),

  resetFilters: () => set({ filters: {} }),

  setTheme: (theme) => set({ theme }),

  toggleSidebar: () =>
    set((state) => ({
      sidebarOpen: !state.sidebarOpen,
    })),

  addNotification: (message, type) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          id: Date.now().toString(),
          message,
          type,
        },
      ],
    })),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));
