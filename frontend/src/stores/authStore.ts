import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, authService } from '../services/auth.service';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name?: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      setToken: (token: string) => {
        authService.setAuthToken(token);
        set({ token, isAuthenticated: true });
      },

      login: async (email: string, password: string): Promise<boolean> => {
        set({ isLoading: true });
        try {
          const response = await authService.login(email, password);
          if (response.success) {
            const { user, token } = response.data;
            authService.setAuthToken(token);
            set({ 
              user, 
              token, 
              isAuthenticated: true, 
              isLoading: false 
            });
            return true;
          }
          set({ isLoading: false });
          return false;
        } catch (error) {
          set({ isLoading: false });
          return false;
        }
      },

      register: async (email: string, password: string, name?: string): Promise<boolean> => {
        set({ isLoading: true });
        try {
          const response = await authService.register(email, password, name);
          if (response.success) {
            const { user, token } = response.data;
            authService.setAuthToken(token);
            set({ 
              user, 
              token, 
              isAuthenticated: true, 
              isLoading: false 
            });
            return true;
          }
          set({ isLoading: false });
          return false;
        } catch (error) {
          set({ isLoading: false });
          return false;
        }
      },

      logout: () => {
        authService.clearAuth();
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false 
        });
      },

      checkAuth: async () => {
        const token = authService.getStoredToken();
        if (!token) {
          get().clearAuth();
          return;
        }

        try {
          authService.setAuthToken(token);
          const response = await authService.getProfile();
          if (response.success && response.data) {
            set({ 
              user: response.data.user, 
              token, 
              isAuthenticated: true 
            });
          } else {
            get().clearAuth();
          }
        } catch (error) {
          get().clearAuth();
        }
      },

      clearAuth: () => {
        authService.clearAuth();
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false 
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);