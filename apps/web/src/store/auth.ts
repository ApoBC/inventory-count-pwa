import { create } from 'zustand';
import { User, AuthResponse } from '@/types';
import { api } from '@/lib/api';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  restoreSession: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<AuthResponse>('/auth/login', {
        username,
        password,
      });

      api.saveTokens(response.accessToken, response.refreshToken);
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al iniciar sesión';
      set({
        error: message,
        isLoading: false,
      });
      throw error;
    }
  },

  logout: () => {
    api.clearTokens();
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    });
  },

  restoreSession: async () => {
    if (!api.isAuthenticated()) {
      set({ isAuthenticated: false });
      return;
    }

    try {
      const user = await api.get<User>('/auth/me');
      set({
        user,
        isAuthenticated: true,
      });
    } catch (error) {
      api.clearTokens();
      set({
        user: null,
        isAuthenticated: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));
