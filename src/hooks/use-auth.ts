import { useAuthStore } from "@/stores/auth-store";

export function useAuth() {
  const { user, token, login, logout, hasRole, isAuthenticating, setAuthenticating } =
    useAuthStore();
  return { user, token, login, logout, hasRole, isAuthenticating, setAuthenticating };
}
