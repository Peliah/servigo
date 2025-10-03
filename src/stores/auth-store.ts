import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, UserRole } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticating: boolean;
  login: (payload: { user: User; token: string }) => void;
  logout: () => void;
  setAuthenticating: (value: boolean) => void;
  hasRole: (role: UserRole) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticating: false,
      login: ({ user, token }) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
      setAuthenticating: (value: boolean) => set({ isAuthenticating: value }),
      hasRole: (role: UserRole) => {
        const current = get().user;
        return !!current && current.user_type === role;
      },
    }),
    {
      name: "auth-store",
      partialize: (state) => ({ user: state.user, token: state.token }),
      version: 1,
    }
  )
);
