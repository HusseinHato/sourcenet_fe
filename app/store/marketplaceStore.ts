'use client';

import { create } from 'zustand';
import { DataPod } from '@/app/types';

interface MarketplaceStore {
  dataPods: DataPod[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;

  setDataPods: (dataPods: DataPod[]) => void;
  addDataPod: (dataPod: DataPod) => void;
  updateDataPod: (id: string, dataPod: Partial<DataPod>) => void;
  removeDataPod: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setTotalCount: (count: number) => void;
  setCurrentPage: (page: number) => void;
  updateFromWebSocket: (dataPod: DataPod) => void;
  clear: () => void;
}

export const useMarketplaceStore = create<MarketplaceStore>((set) => ({
  dataPods: [],
  isLoading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,

  setDataPods: (dataPods) => set({ dataPods }),

  addDataPod: (dataPod) =>
    set((state) => ({
      dataPods: [dataPod, ...state.dataPods],
      totalCount: state.totalCount + 1,
    })),

  updateDataPod: (id, updates) =>
    set((state) => ({
      dataPods: state.dataPods.map((pod) =>
        pod.id === id ? { ...pod, ...updates } : pod
      ),
    })),

  removeDataPod: (id) =>
    set((state) => ({
      dataPods: state.dataPods.filter((pod) => pod.id !== id),
      totalCount: state.totalCount - 1,
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setTotalCount: (totalCount) => set({ totalCount }),

  setCurrentPage: (currentPage) => set({ currentPage }),

  updateFromWebSocket: (dataPod) =>
    set((state) => ({
      dataPods: state.dataPods.map((pod) =>
        pod.id === dataPod.id ? dataPod : pod
      ),
    })),

  clear: () =>
    set({
      dataPods: [],
      isLoading: false,
      error: null,
      totalCount: 0,
      currentPage: 1,
    }),
}));
