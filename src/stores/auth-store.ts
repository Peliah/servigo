import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, UserRole } from "@/types";
import { mockApi } from "@/lib/mock-api";
import { AuthSimulation, initializeDummyUsers } from "@/lib/auth-simulation";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticating: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    user_type: UserRole;
  }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticating: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isAuthenticating: true, error: null });

        try {
          const response = await mockApi.auth.login({ email, password });

          if (response.success && response.data) {
            set({
              user: response.data.user,
              token: response.data.token,
              isAuthenticating: false
            });
          } else {
            set({
              error: response.error || 'Login failed',
              isAuthenticating: false
            });
            throw new Error(response.error || 'Login failed');
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isAuthenticating: false
          });
          throw error;
        }
      },

      register: async (data) => {
        set({ isAuthenticating: true, error: null });

        try {
          const response = await mockApi.auth.register(data);

          if (response.success && response.data) {
            set({
              user: response.data.user,
              token: response.data.token,
              isAuthenticating: false
            });
          } else {
            set({
              error: response.error || 'Registration failed',
              isAuthenticating: false
            });
            throw new Error(response.error || 'Registration failed');
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Registration failed',
            isAuthenticating: false
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isAuthenticating: true });

        try {
          await mockApi.auth.logout();
          set({ user: null, token: null, isAuthenticating: false });
        } catch (error) {
          // Even if logout fails on server, clear local state
          set({ user: null, token: null, isAuthenticating: false });
        }
      },

      checkAuth: async () => {
        set({ isAuthenticating: true });

        try {
          const response = await mockApi.auth.verifyToken();

          if (response.success && response.data) {
            set({
              user: response.data,
              token: AuthSimulation.getCurrentToken(),
              isAuthenticating: false
            });
          } else {
            set({
              user: null,
              token: null,
              isAuthenticating: false
            });
          }
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticating: false
          });
        }
      },

      clearError: () => set({ error: null }),

      hasRole: (role: UserRole) => {
        const current = get().user;
        return !!current && current.user_type === role;
      },

      hasAnyRole: (roles: UserRole[]) => {
        const current = get().user;
        return !!current && roles.includes(current.user_type);
      },
    }),
    {
      name: "auth-store",
      partialize: (state) => ({ user: state.user, token: state.token }),
      version: 1,
      onRehydrateStorage: () => (state) => {
        // Initialize dummy users on first load
        if (typeof window !== 'undefined') {
          initializeDummyUsers();
        }
      },
    }
  )
);
