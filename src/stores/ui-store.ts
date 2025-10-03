import { create } from "zustand";

interface UiState {
  sidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;
  toggleSidebar: () => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  sidebarOpen: false,
  setSidebarOpen: (value: boolean) => set({ sidebarOpen: value }),
  toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
}));
