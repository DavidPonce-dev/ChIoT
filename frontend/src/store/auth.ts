import { create } from "zustand";
import { api } from "@/lib/api";

interface User {
  id: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: async () => {
    try {
      await api.auth.logout();
    } catch (err) {
      console.error("Logout error:", err);
    }
    set({ user: null, isAuthenticated: false });
  },
  checkAuth: async () => {
    const currentState = get();
    if (currentState.isAuthenticated && currentState.user) {
      set({ isLoading: false });
      return;
    }
    set({ isLoading: true });
    try {
      const response = await api.auth.me();
      set({
        user: { id: response.user._id, email: response.user.email },
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
